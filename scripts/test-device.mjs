// Test the production adapter with a synthetic API and clock. No TV access.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const source = readFileSync(new URL('../app/device.js', import.meta.url), 'utf8');
test('guide requests a bounded future window and never inserts the current programme into it', () => {
  const h = harness(), now = new Date(), future = now.getTime()+10800000,ch={major:3};
  h.window.tizen.TZDate=Date;h.window.tizen.time={getCurrentDateTime:()=>now};
  h.window.tizen.tvchannel={getCurrentChannel:()=>ch,getCurrentProgram:()=>({title:'Current',startTime:new Date(now.getTime()-10000),duration:1200}),
    getProgramList:(c,start,ok,fail,duration)=>{
      assert.equal(start.getTime(),future);assert.equal(duration,10800);
      ok([{title:'Future',startTime:new Date(future),duration:3600},{title:'Beyond window',startTime:new Date(future+10800000),duration:3600}]);
    }};
  h.device.programs(ch,(err,data)=>{assert.equal(err,null);assert.equal(data.schedule.length,1);assert.equal(data.schedule[0].title,'Future');assert.equal(data.current,null);},{start:future});
  assert.equal(h.changes.length,0);
});
test('EPG filters expired/invalid entries, sorts next and reads TZDate fields without tuning', () => {
  const h = harness(), now = new Date(), ch = { major: 3, minor: 0, programNumber: 813, transportStreamID: 101 };
  const p = (title, offset, duration = 3600) => ({ title, startTime: new Date(now.getTime() + offset), duration, detailedDescription: 'Sin descripción.' });
  h.window.tizen.time = { getCurrentDateTime: () => now };
  h.window.tizen.tvchannel = { getCurrentChannel: () => ch, getCurrentProgram: () => p('Current', -60000),
    getProgramList: (channel, start, ok) => ok([p('Later', 7200000), p('Expired', -9000000), p('Next', 3600000), p('Invalid', 0, -1)]) };
  let data;h.device.programs(ch, (err, value) => { assert.equal(err, null);data = value; });
  assert.equal(data.current.title, 'Current');assert.equal(data.current.description, '');assert.equal(data.next.title, 'Next');
  assert.equal(h.changes.length, 0);assert.equal(h.launches.length, 0);
});
test('EPG cannot show current tuner metadata for a different selected channel', () => {
  const h = harness(), now = new Date();h.window.tizen.time = { getCurrentDateTime: () => now };
  h.window.tizen.tvchannel = { getCurrentChannel: () => ({ major: 3 }), getCurrentProgram: () => { throw Error('Wrong channel read'); },getProgramList: (ch, start, ok) => ok([]) };
  h.device.programs({ major: 1 }, (err, data) => { assert.equal(err, null);assert.equal(data.current, null);assert.equal(data.next, null); });
});
test('EPG timeout completes once and ignores a late schedule', () => {
  const h = harness(), results = [];let success;h.window.tizen.time = { getCurrentDateTime: () => new Date() };
  h.window.tizen.tvchannel = { getProgramList: (ch, start, ok) => { success = ok; } };
  h.device.programs({ major: 1 }, (err, data) => results.push({ err, data }));h.advance(10000);
  assert.equal(results.length, 1);assert.ok(results[0].err);success([]);assert.equal(results.length, 1);
});
function harness({ supported = true, throwSource = false } = {}) {
  let now = 0, next = 0;
  const timers = new Map(), requests = [], launches = [], sourceRequests = [], changes = [];
  let current = { type: 'HDMI', number: 2 };
  const application = {
    getCurrentApplication: () => ({ appInfo: { id: 'Owner12345.Home' } }),
    getAppsInfo: (ok, fail) => requests.push({ ok, fail }),
    launch: (id, ok, fail) => launches.push({ id, ok, fail })
  };
  const window = { tizen: { application } };
  if (supported) {
    window.tizen.systeminfo = { getPropertyValue: (name, ok, fail) => { assert.equal(name, 'VIDEOSOURCE'); sourceRequests.push({ ok, fail }); } };
    window.tizen.tvwindow = { getSource: (...args) => { assert.equal(args.length, 0); return current; },
      setSource: (source, ok, fail) => { if (throwSource) throw Error('Synthetic SDK failure'); changes.push({ source, ok, fail }); } };
  }
  vm.runInNewContext(source, {
    window, tizen: window.tizen,
    setTimeout: (callback, delay) => { const id = ++next; timers.set(id, { callback, at: now + delay }); return id; },
    clearTimeout: id => timers.delete(id)
  });
  function advance(ms) {
    now += ms;
    for (const [id, timer] of timers) if (timer.at <= now) { timers.delete(id); timer.callback(); }
  }
  return { window, device: window.FrameDevice, requests, launches, sourceRequests, changes, advance, setCurrent: value => { current = value; } };
}

test('a 500-app catalogue can arrive after the old eight-second deadline', () => {
  const h = harness(), results = [];
  h.device.apps((error, apps) => results.push({ error, apps }));
  assert.equal(h.requests.length, 1);
  h.advance(15000);
  assert.equal(results.length, 0);
  h.requests[0].ok(Array.from({ length: 500 }, (_, i) => ({ id: 'App' + String(i).padStart(7, '0') + '.Consumer', name: 'App ' + i, show: true })));
  assert.equal(results.length, 1);
  assert.equal(results[0].error, null);
  assert.equal(results[0].apps.length, 500);
});

test('catalogue timeout and late callbacks finish only once', () => {
  const h = harness(), results = [];
  h.device.apps((error, apps) => results.push({ error, apps }));
  h.advance(19999);
  assert.equal(results.length, 0);
  h.advance(1);
  assert.equal(results.length, 1);
  assert.match(results[0].error.message, /no ha respondido/);
  h.requests[0].ok([]);
  h.requests[0].fail({ message: 'Late failure' });
  assert.equal(results.length, 1);
});

test('regional streaming apps stay distinct and system helpers stay hidden', () => {
  const h = harness();
  let apps;
  h.device.apps((error, value) => { assert.equal(error, null); apps = value; });
  h.requests[0].ok([
    { id: 'Owner12345.Home', name: 'My Home', show: true },
    { id: '9Ur5IzDKqV.TizenYouTube', name: 'YouTube', show: false },
    { id: 'PvWgqxV3Xa.YouTubeTV', name: 'YouTube TV', show: false },
    { id: 'cj37Ni3qXM.HBONow', name: 'HBO Max', show: false },
    { id: '2022ePop01.SmartTV', name: 'Smart TV', show: true },
    { id: 'd0m1lV1nt2.emanual', name: 'User Guide', show: true },
    { id: 'Hidden1234.Consumer', name: 'Hidden app', show: false }
  ]);
  assert.equal(apps.length, 3);
  assert.equal(apps.find(a => a.name === 'YouTube').brand, 'youtube');
  assert.equal(apps.find(a => a.name === 'YouTube TV').brand, '');
  assert.equal(apps.find(a => a.name === 'HBO Max').brand, 'hbomax');
});

test('launch keeps its eight-second deadline independently of discovery', () => {
  const h = harness(), results = [];
  h.device.launchApp('Synthetic.App', error => results.push(error));
  h.advance(8000);
  assert.equal(results.length, 1);
  assert.match(results[0].message, /no ha respondido/);
  h.launches[0].ok();
  assert.equal(results.length, 1);
});

const video = { connected: [{ type: 'HDMI', number: 2 }], disconnected: [{ type: 'HDMI', number: 1 }, { type: 'HDMI', number: 3 }] };
test('inputs use actual connected and sleeping source records and synchronous active status', () => {
  const h = harness(); let result;
  h.device.sources((error, inputs) => { assert.equal(error, null); result = inputs; });
  h.sourceRequests[0].ok({ connected: video.connected, disconnected: [...video.disconnected, { type: 'HDMI', number: 2 }, { type: 'TV', number: 0 }] });
  assert.deepEqual(Array.from(result, x => x.number), [1, 2, 3]);
  assert.equal(result.find(x => x.number === 2).active, true);
  assert.equal(result.find(x => x.number === 2).connected, true);
  assert.equal(result.find(x => x.number === 1).connected, false);
});
test('input absence, denial, empty discovery and timeout never invent ports', () => {
  const absent = harness({ supported: false }); let error;
  absent.device.sources(e => { error = e; }); assert.ok(error);
  for (const mode of ['denied', 'empty', 'timeout']) {
    const h = harness(), results = [];
    h.device.sources((error, inputs) => results.push({ error, inputs }));
    if (mode === 'denied') h.sourceRequests[0].fail({ name: 'SecurityError' });
    else if (mode === 'empty') h.sourceRequests[0].ok({ connected: [], disconnected: [] });
    else h.advance(8000);
    assert.equal(results.length, 1);
    if (mode === 'empty') assert.equal(results[0].inputs.length, 0);
    else { assert.ok(results[0].error); assert.equal(results[0].inputs, undefined); }
    h.sourceRequests[0].ok(video); assert.equal(results.length, 1);
  }
});
test('input switching uses a discovered disconnected record and completes only after viewer launch', () => {
  const h = harness(), results = [];
  h.device.setSource(1, (error, input) => results.push({ error, input }));
  h.sourceRequests[0].ok(video);
  assert.equal(h.changes[0].source, video.disconnected[0]);
  h.changes[0].ok(video.disconnected[0]); assert.equal(results.length, 0);
  assert.equal(h.launches[0].id, 'org.tizen.tv-viewer');
  h.launches[0].ok(); assert.equal(results[0].error, null);
  assert.equal(results[0].input.number, 1);
});
test('source and viewer failures are errors and never hide the launcher', () => {
  for (const mode of ['source', 'throw', 'viewer', 'different']) {
    const h = harness({ throwSource: mode === 'throw' }), results = [];
    h.device.setSource(2, error => results.push(error));
    if (mode === 'throw') {
      h.sourceRequests[0].ok(video);
    } else {
      h.sourceRequests[0].ok(video);
      if (mode === 'source') h.changes[0].fail({ name: 'SecurityError' });
      else if (mode === 'different') h.changes[0].ok({ type: 'HDMI', number: 3 });
      else { h.changes[0].ok(video.connected[0]); h.launches[0].fail({ name: 'NotFoundError' }); }
    }
    assert.equal(results.length, 1); assert.ok(results[0]);
    assert.equal(h.launches.length, mode === 'viewer' ? 1 : 0);
  }
});
test('cancelled and timed-out input requests cannot initiate later device operations', () => {
  for (const mode of ['timeout', 'cancel']) {
    const h = harness(), results = [];
    h.device.setSource(2, error => results.push(error));
    if (mode === 'timeout') h.advance(8000); else h.device.cancelSource();
    assert.equal(results.length, 1); assert.ok(results[0]);
    h.sourceRequests[0].ok(video); assert.equal(h.changes.length, 0); assert.equal(h.launches.length, 0);
    const pending = harness(); pending.device.setSource(2, () => {}); pending.sourceRequests[0].ok(video);
    if (mode === 'timeout') pending.advance(8000); else pending.device.cancelSource();
    pending.changes[0].ok(video.connected[0]); assert.equal(pending.launches.length, 0);
  }
});
test('unknown and invalid ports cannot be substituted and a newer request cancels the old one', () => {
  for (const port of [-1, 1.5, '2', Infinity, 4]) {
    const h = harness(), results = []; h.device.setSource(port, error => results.push(error));
    if (port === 4) h.sourceRequests[0].ok(video);
    assert.equal(results.length, 1); assert.ok(results[0]); assert.equal(h.changes.length, 0);
  }
  const h = harness(), results = [];
  h.device.setSource(1, error => results.push(error)); h.device.setSource(2, () => {});
  assert.equal(results[0].cancelled, true);
  h.sourceRequests[0].ok(video); assert.equal(h.changes.length, 0);
  h.sourceRequests[1].ok(video); assert.equal(h.changes[0].source.number, 2);
});

test('live TV uses a discovered tuner and waits for the viewer; late cancellation cannot launch it', () => {
  const h = harness(), results = [], tuner = { type: 'TV', number: 0 };
  h.device.liveTV(error => results.push(error));
  h.sourceRequests[0].ok({ connected: [tuner] });
  assert.equal(h.changes[0].source, tuner);
  h.changes[0].ok(tuner);
  assert.equal(h.launches[0].id, 'org.tizen.tv-viewer');
  assert.equal(results.length, 0);
  h.launches[0].ok();
  assert.deepEqual(results, [null]);
  h.device.liveTV(error => results.push(error));
  h.device.cancelSource();
  h.sourceRequests[1].ok({ connected: [tuner] });
  assert.equal(h.changes.length, 1);
  assert.equal(results[1].cancelled, true);
});

test('live TV does not invent a tuner, and timeout blocks late switching', () => {
  const h = harness(), results = [];
  h.device.liveTV(error => results.push(error));
  h.sourceRequests[0].ok({ connected: [{ type: 'HDMI', number: 1 }] });
  assert.ok(results[0]);
  assert.equal(h.changes.length, 0);
  h.device.liveTV(error => results.push(error));
  h.advance(8000);
  h.sourceRequests[1].ok({ connected: [{ type: 'TV', number: 0 }] });
  assert.equal(results.length, 2);
  assert.equal(h.changes.length, 0);
});

test('HDMI source-provided names are used when available, retaining the actual port', () => {
  const h = harness();let result;
  h.device.sources((error, list) => { assert.equal(error, null);result = list; });
  h.sourceRequests[0].ok({ connected: [{ type: 'HDMI', number: 3, name: '  Consola  ' }] });
  assert.equal(result[0].name, 'Consola');
  assert.equal(result[0].number, 3);
});


test('TV preview stays inside the launcher and cancellation hides a late native window', () => {
  const h = harness(), shows = [], hides = [], results = [];
  h.window.tizen.tvwindow.show = (ok, fail, rect, type) => shows.push({ ok, fail, rect, type });
  h.window.tizen.tvwindow.hide = ok => { hides.push(true); ok(); };
  h.device.previewTV(['0px', '0px', '960px', '540px'], error => results.push(error));
  h.sourceRequests[0].ok({ connected: [{ type: 'TV', number: 0 }] });
  h.changes[0].ok({ type: 'TV', number: 0 });
  assert.equal(h.launches.length, 0);
  assert.equal(shows.length, 1);
  h.device.hidePreview();
  shows[0].ok();
  assert.equal(results.length, 1);
  assert.equal(results[0].cancelled, true);
  assert.ok(hides.length >= 1);
});

test('TV preview cannot change a source when native preview is unsupported', () => {
  const h = harness(), results = [];
  h.device.previewTV(['0px', '0px', '960px', '540px'], error => results.push(error));
  assert.ok(results[0]);
  assert.equal(h.sourceRequests.length, 0);
  assert.equal(h.changes.length, 0);
});

test('channel permission denial reports a real error and app store uses the TV store ID', () => {
  const h = harness(), results = [];
  h.window.tizen.tvchannel = { getChannelList: () => { throw Error('SecurityError'); } };
  h.device.channels(error => results.push(error));
  assert.ok(results[0]);
  h.device.store(error => results.push(error));
  assert.equal(h.launches[0].id, 'org.volt.apps');
  h.launches[0].ok();
  assert.equal(results[1], null);
});


test('channel listing requests at most 15 rows per call and loads subsequent pages', () => {
  const h = harness(), calls = [], results = [];
  const all = Array.from({ length: 42 }, (_, i) => ({ major: i + 1, minor: 0, channelName: 'Channel ' + (i + 1) }));
  h.window.tizen.tvchannel = { getChannelList: (ok, fail, type, offset, count) => {
    calls.push({ type, offset, count }); assert.equal(count, 15); ok(all.slice(offset, offset + count));
  } };
  h.device.channels((error, list) => results.push({ error, list }));
  h.advance(0);
  assert.deepEqual(calls.map(c => c.offset), [0, 15, 30]);
  assert.equal(results.length, 1);assert.equal(results[0].error, null);assert.equal(results[0].list.length, 42);
});

test('channel paging stops when firmware repeats a page and ignores callbacks after timeout', () => {
  const h = harness(), calls = [], results = [];
  const page = Array.from({ length: 15 }, (_, i) => ({ major: i + 1 }));
  h.window.tizen.tvchannel = { getChannelList: ok => { calls.push(ok);ok(page); } };
  h.device.channels((error, list) => results.push({ error, list }));h.advance(0);
  assert.equal(calls.length, 2);assert.equal(results[0].list.length, 15);
  h.window.tizen.tvchannel.getChannelList = ok => calls.push(ok);
  h.device.channels((error, list) => results.push({ error, list }));h.advance(15000);
  const total = calls.length;calls[calls.length - 1](page);h.advance(0);
  assert.equal(calls.length, total);assert.equal(results.length, 2);assert.ok(results[1].error);
});

test('both UI settings routes use the visually verified Samsung quick-settings target', () => {
  const h = harness(), results = [];
  h.device.settings(error => results.push(error));
  assert.equal(h.launches[0].id, 'com.samsung.tv.quicksetting');
  h.launches[0].ok();assert.deepEqual(results, [null]);
});


test('tuning supplies the firmware listener object, full channel identity and MAIN window', () => {
  const h = harness(), requests = [], results = [];
  h.window.tizen.tvchannel = { tune: (option, listener, fail, windowType) => {
    assert.equal(typeof listener, 'object');assert.equal(typeof listener.onsuccess, 'function');assert.equal(typeof listener.onnosignal, 'function');assert.equal(typeof listener.onprograminforeceived, 'function');
    requests.push({ option, listener, fail, windowType });
  } };
  h.device.tuneChannel({ major: 3, minor: 0, ptc: 24, programNumber: 101, transportStreamID: 55 }, error => results.push(error));
  assert.equal(requests[0].option.ptc, 24);assert.equal(requests[0].option.programNumber, 101);assert.equal(requests[0].windowType, 'MAIN');
  requests[0].listener.onprograminforeceived({});assert.equal(results.length, 0);
  requests[0].listener.onsuccess({ major: 3 });assert.deepEqual(results, [null]);
  requests[0].listener.onnosignal();assert.equal(results.length, 1);
});

test('tuning does not report success for no-signal or a different channel', () => {
  const h = harness(), requests = [], results = [];
  h.window.tizen.tvchannel = { tune: (option, listener) => requests.push(listener) };
  h.device.tuneChannel({ major: 3 }, error => results.push(error));requests[0].onnosignal();assert.ok(results[0]);
  h.device.tuneChannel({ major: 5 }, error => results.push(error));requests[1].onsuccess({ major: 7 });assert.ok(results[1]);
});

test('imported native HDMI names label the actual port without remapping a different shortcut', () => {
  const h = harness(); h.window.CleanFrameSourceNames = {3:'Steam'};
  let inputs;h.device.sources((error,list)=>{assert.equal(error,null);inputs=list});
  h.sourceRequests[0].ok({connected:[{type:'HDMI',number:3}],disconnected:[{type:'HDMI',number:2}]});
  assert.equal(inputs.find(i=>i.number===3).name,'Steam');
  assert.equal(inputs.find(i=>i.number===2).name,'HDMI 2');
  h.device.setSource(3,()=>{});h.sourceRequests[1].ok({connected:[{type:'HDMI',number:3}],disconnected:[{type:'HDMI',number:2}]});
  assert.equal(h.changes[0].source.number,3);
  h.changes[0].ok({type:'HDMI',number:3});h.launches[0].ok();
});
