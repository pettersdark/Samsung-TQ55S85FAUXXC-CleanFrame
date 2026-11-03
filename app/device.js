/* Public Tizen application APIs. No Mac server, network address or credentials. */
(function () {
  'use strict';
  var IDS = {
    stremio: 'IkWsFHtOY9.Stremio', netflix: 'org.tizen.netflix-app',
    disneyplus: 'MCmYXNxgcu.DisneyPlus', youtube: '9Ur5IzDKqV.TizenYouTube',
    appletv: 'com.samsung.tv.aria-video', primevideo: 'org.tizen.primevideo',
    abciview: 'mWK87Xghap.ABCiview', sbs: 'OyE7OuxlUi.SBSOnDemand',
    applemusic: 'org.tizen.apple.apple-music'
  };
  var STREAMING = ['as6cYRgkPy.Binge', '73iTZRTc34.Stan', '5b8c3eb16b.BeamCTVDev',
    'cj37Ni3qXM.HBONow', 'LBUAQX1exg.Hulu', 'gzcc4LRFBF.Peacock', 'rJyOSqC6Up.CBSAllAccess',
    'Rk72oKFsRS.OtterKidsProd', '70fRFUwYlD.OtterGAProd', 'PvWgqxV3Xa.YouTubeTV',
    'XtU8fQk2gN.ESPN', 'ZmmGjO6VKO.slingtv', 'VtuWAiZdHN.STARZPlay', 'ckfgqqzvt0.dplus',
    'kk8MbItQ0H.VUDU', 'Jz7aUrV2Q4.Twitch', 'OK2Rdkjmsi.IMDbTV', 'Ob3XhAVMu6.amcplus',
    'KaLitts8bq.tenplaySamsungTizen', 'eYuOiOLYQX.KayoSports', 'Ne2ZsPWdKl.9NOW',
    '3KA0pm7a7V.TubiTV', 'rJeHak5zRg.Spotify', 'icp4AvUPiA.7plus'];
  var CONSUMER_SYSTEM = ['org.tizen.browser', 'com.microsoft.copilot'];
  var EXTRA_BRANDS = {'rJeHak5zRg.Spotify': 'spotify', '5b8c3eb16b.BeamCTVDev': 'hbomax', 'cj37Ni3qXM.HBONow': 'hbomax', '3KA0pm7a7V.TubiTV': 'tubi'};
  function nameBrand(name) { var key = String(name || '').toLowerCase().replace(/[^a-z0-9+]/g, ''); return key === '3cat' || key === 'tv3' ? '3cat' : key === 'crunchyroll' ? 'crunchyroll' : key === 'smarttvclub' || key === 'iptvsmarttvclub' ? 'smarttvclub' : key === 'skyshowtime' ? 'skyshowtime' : key === 'atresplayer' || key === 'atresplayerpremium' ? 'atresplayer' : key === 'disney+' || key === 'disneyplus' ? 'disneyplus' : ''; }
  EXTRA_BRANDS['PzkKxRdFT6.TV3'] = '3cat'; EXTRA_BRANDS['skysh0WTIM.SkyShowtime'] = 'skyshowtime';
  EXTRA_BRANDS['OGLLvqej7u.CrunchyrollWebApp'] = 'crunchyroll'; EXTRA_BRANDS['34lSUifemi.SmartTVClub'] = 'smarttvclub';
  var INTERNAL = ['25emanual2.emanual', 'w2VwCK465D.OTApp', 'adplatform.ADPlayer', 'WykOS4t4F0.cmsWebApp', '25emanual3.emanual',
    'd0m1lV1nt2.emanual', '2022ePop01.SmartTV',
    'ZODRT12q2l.WebAccountExtension', 'ByJlgt0XeD.CastSettingsApp', 'tv6pbVMQFF.PrivacyChoices'];
  var SELF = 'nClrkHome1.FrameHome';
  function api() { return window.tizen && window.tizen.application; }
  function selfId() {
    try { return api().getCurrentApplication().appInfo.id || SELF; }
    catch (err) { return SELF; }
  }
  function unavailable(done) {
    done({ message: 'Abre CleanFrame en la TV para usar este control.', detail: 'La vista previa del PC no puede controlar la TV.' });
  }
  function failure(err) {
    return { message: 'La TV no pudo abrir esta pantalla.', detail: err && (err.message || err.name) || 'Reintenta o pulsa Inicio en el mando para volver a CleanFrame.' };
  }
  function bounded(done, timeout) {
    var finished = false, timer = setTimeout(function () { finish({ message: 'La TV no ha respondido. Inténtalo de nuevo.' }); }, timeout || 8000);
    function finish(err, value) { if (finished) return; finished = true; clearTimeout(timer); done(err, value); }
    return finish;
  }
  var sourceCancel = null;
  function cancelSource() { if (sourceCancel) sourceCancel(); }
  function sources(done) {
    var sys = window.tizen && window.tizen.systeminfo, tvw = window.tizen && window.tizen.tvwindow;
    if (!sys || typeof sys.getPropertyValue !== 'function' || !tvw || typeof tvw.setSource !== 'function') { unavailable(done); return; }
    var finish = bounded(done);
    try {
      sys.getPropertyValue('VIDEOSOURCE', function (video) {
        var list = [], byPort = {}, active = null;
        try { if (typeof tvw.getSource === 'function') active = tvw.getSource(); } catch (err) { /* Status may be unavailable while discovery still works. */ }
        function record(src, connected) {
          if (!src || src.type !== 'HDMI' || typeof src.number !== 'number' || !isFinite(src.number) || src.number < 0 || Math.floor(src.number) !== src.number) return;
          var key = String(src.number), item = byPort[key], imported = window.CleanFrameSourceNames && window.CleanFrameSourceNames[key];
          var label = typeof src.name === 'string' && src.name.trim() ? src.name.trim().slice(0, 80) : typeof imported === 'string' && imported.trim() ? imported.trim().slice(0, 80) : 'HDMI ' + src.number;
          if (!item) {
            item = { number: src.number, name: label, connected: false, active: !!(active && active.type === 'HDMI' && active.number === src.number), source: src };
            byPort[key] = item; list.push(item);
          }
          if (connected) { item.connected = true; item.source = src; item.name = label; }
        }
        if (video && Array.isArray(video.disconnected)) video.disconnected.forEach(function (src) { record(src, false); });
        if (video && Array.isArray(video.connected)) video.connected.forEach(function (src) { record(src, true); });
        list.sort(function (a, b) { return a.number - b.number; });
        finish(null, list);
      }, function (err) { finish(failure(err)); });
    } catch (err) { finish(failure(err)); }
  }
  function setSource(port, done) {
    cancelSource();
    var tvw = window.tizen && window.tizen.tvwindow, app = api(), finished = false;
    if (typeof port !== 'number' || !isFinite(port) || port < 0 || Math.floor(port) !== port) { done({ message: 'Esta entrada HDMI no está disponible.' }); return; }
    if (!tvw || typeof tvw.setSource !== 'function' || !app || typeof app.launch !== 'function') { unavailable(done); return; }
    var timer = setTimeout(function () { finish({ message: 'La TV no ha respondido. Inténtalo de nuevo.' }); }, 8000);
    function finish(err, value) {
      if (finished) return;
      finished = true; clearTimeout(timer);
      if (sourceCancel === cancel) sourceCancel = null;
      done(err, value);
    }
    function cancel() { finish({ message: 'Cambio de entrada cancelado.', cancelled: true }); }
    sourceCancel = cancel;
    sources(function (err, list) {
      if (finished) return;
      if (err) { finish(err); return; }
      var input = null;
      list.some(function (item) { if (item.number === port) { input = item; return true; } return false; });
      if (!input) { finish({ message: 'Esta entrada HDMI ya no está disponible.' }); return; }
      try {
        tvw.setSource(input.source, function (selected) {
          if (finished) return;
          if (selected && (selected.type !== 'HDMI' || selected.number !== port)) { finish({ message: 'La TV seleccionó otra entrada. Inténtalo de nuevo.' }); return; }
          try {
            app.launch('org.tizen.tv-viewer', function () { finish(null, input); }, function () {
              finish({ message: 'La entrada se seleccionó, pero no se pudo abrir el visor de TV.', detail: 'Usa el botón de entradas del mando para verla.' });
            });
          } catch (error) { finish({ message: 'La entrada se seleccionó, pero no se pudo abrir el visor de TV.' }); }
        }, function (error) { if (!finished) finish(failure(error)); }, 'MAIN');
      } catch (error) { finish(failure(error)); }
    });
  }
  // Discover a real tuner source before changing the source. Never invent a port.
  function tuneTV(done, viewer) {
    cancelSource();
    var sys = window.tizen && window.tizen.systeminfo, tvw = window.tizen && window.tizen.tvwindow, app = api();
    if (!sys || !tvw || typeof sys.getPropertyValue !== 'function' || typeof tvw.setSource !== 'function' || !app || typeof app.launch !== 'function') { unavailable(done); return; }
    var finished = false, timer = setTimeout(function () { finish({ message: 'La TV no ha respondido. Inténtalo de nuevo.' }); }, 8000);
    function finish(err) {
      if (finished) return;
      finished = true; clearTimeout(timer);
      if (sourceCancel === cancel) sourceCancel = null;
      done(err);
    }
    function cancel() { finish({ message: 'Apertura de TV cancelada.', cancelled: true }); }
    sourceCancel = cancel;
    try {
      sys.getPropertyValue('VIDEOSOURCE', function (video) {
        if (finished) return;
        var source = null, list = (video && Array.isArray(video.connected) ? video.connected : []).concat(video && Array.isArray(video.disconnected) ? video.disconnected : []);
        list.some(function (item) { if (item && item.type === 'TV' && typeof item.number === 'number' && isFinite(item.number) && item.number >= 0 && Math.floor(item.number) === item.number) { source = item; return true; } return false; });
        if (!source) { finish({ message: 'La TV no ha comunicado una fuente de televisión.', detail: 'Selecciona TV en directo desde el menú de Samsung.' }); return; }
        try {
          tvw.setSource(source, function (selected) {
            if (finished) return;
            if (selected && (selected.type !== 'TV' || selected.number !== source.number)) { finish({ message: 'La TV ha seleccionado otra fuente.' }); return; }
            if (!viewer) { finish(null); return; }
            try { app.launch('org.tizen.tv-viewer', function () { finish(null); }, function (err) { finish(failure(err)); }); }
            catch (err) { finish(failure(err)); }
          }, function (err) { if (!finished) finish(failure(err)); });
        } catch (err) { finish(failure(err)); }
      }, function (err) { finish(failure(err)); });
    } catch (err) { finish(failure(err)); }
  }
  function liveTV(done) { tuneTV(done, true); }
  var previewToken = 0;
  function hidePreview(done) {
    previewToken++; cancelSource();
    var tvw = window.tizen && window.tizen.tvwindow;
    if (!tvw || typeof tvw.hide !== 'function') { if (done) done(null); return; }
    var finish = bounded(done || function () {});
    try { tvw.hide(function () { finish(null); }, function (err) { finish(failure(err)); }); }
    catch (err) { finish(failure(err)); }
  }
  function previewTV(rect, done) {
    var tvw = window.tizen && window.tizen.tvwindow, token = ++previewToken, finish = bounded(done, 16000);
    if (!tvw || typeof tvw.show !== 'function') { unavailable(finish); return; }
    tuneTV(function (err) {
      if (token !== previewToken) { finish({ cancelled: true, message: 'Vista previa cancelada.' }); return; }
      if (err) { finish(err); return; }
      try { tvw.show(function () {
        if (token !== previewToken) { hidePreview(); finish({ cancelled: true, message: 'Vista previa cancelada.' }); return; }
        finish(null);
      }, function (error) { finish(failure(error)); }, rect, 'MAIN'); }
      catch (error) { finish(failure(error)); }
    }, false);
  }
  // EPG reads never tune a channel. Firmware may return its entire cached day.
  function programs(channel, done, options) {
    var finish = bounded(done, 10000), api, clock, now = Date.now(), current = null, from = 0;
    function normalize(p) {
      if (!p || !p.startTime || typeof p.startTime.getFullYear !== 'function') return null;
      var t = p.startTime, start = new Date(t.getFullYear(), t.getMonth(), t.getDate(), t.getHours(), t.getMinutes(), t.getSeconds()).getTime();
      var duration = Number(p.duration), title = String(p.title || '').replace(/\s+/g, ' ').trim().slice(0, 240);
      if (!isFinite(start) || !isFinite(duration) || duration <= 0 || duration > 172800 || !title) return null;
      var description = String(p.detailedDescription || '').replace(/\s+/g, ' ').trim().slice(0, 4000);
      if (/^(sense descripci[oó]\.?|sin descripci[oó]n\.?|no description\.?)$/i.test(description)) description = '';
      return { title: title, description: description, start: start, end: start + duration * 1000 };
    }
    function complete(list) {
      var rows = [], seen = {};
      (Array.isArray(list) ? list.slice(0, 150) : []).forEach(function (p) {
        var item = normalize(p);
        if (!item || item.end <= (from || now) || item.start >= (from ? from + 10800000 : now + 86400000)) return;
        var key = item.start + ':' + item.title;
        if (!seen[key]) { seen[key] = true; rows.push(item); }
      });
      if (current && (!from || current.end > from && current.start < from + 10800000) && !rows.some(function (p) { return p.start <= now && p.end > now; })) rows.push(current);
      rows.sort(function (a, b) { return a.start - b.start; });
      finish(null, { schedule: rows, current: rows.filter(function (p) { return p.start <= now && p.end > now; })[0] || null,
        next: rows.filter(function (p) { return p.start > now; })[0] || null });
    }
    try {
      api = window.tizen && window.tizen.tvchannel;
      if (!api) { unavailable(finish); return; }
      clock = window.tizen.time && window.tizen.time.getCurrentDateTime();
      if (clock) now = new Date(clock.getFullYear(), clock.getMonth(), clock.getDate(), clock.getHours(), clock.getMinutes(), clock.getSeconds()).getTime();
      if (typeof api.getCurrentProgram === 'function' && typeof api.getCurrentChannel === 'function') {
        var active = api.getCurrentChannel();
        if (!channel || active && active.major === channel.major && active.minor === channel.minor && active.programNumber === channel.programNumber && active.transportStreamID === channel.transportStreamID) {
          current = normalize(api.getCurrentProgram());
          if (current && !(current.start <= now && current.end > now)) current = null;
        }
        if (!channel) channel = active;
      }
      if (!channel || !clock || typeof api.getProgramList !== 'function') { complete([]); return; }
      if (options && isFinite(options.start) && Math.abs(options.start - now) <= 172800000) {
        from = options.start;
        clock = new window.tizen.TZDate(new Date(from));
      }
      api.getProgramList(channel, clock, complete, function () { complete([]); }, 10800);
    } catch (err) { if (current) complete([]); else finish(failure(err)); }
  }
  var channelDiagnostic = {};
  function saveChannelDiagnostic(values) {
    Object.keys(channelDiagnostic).forEach(function (key) { delete channelDiagnostic[key]; });
    Object.keys(values).forEach(function (key) { channelDiagnostic[key] = values[key]; });
    try { if (window.localStorage) window.localStorage.setItem('cleanframe.channel.diagnostic', JSON.stringify(channelDiagnostic)); } catch (err) { /* Diagnostics must not prevent TV use. */ }
  }
  function channels(done) {
    var channelAPI, size = 15, offset = 0, items = [], seen = {}, stopped = false;
    function fail(err) {
      if (stopped) return;
      saveChannelDiagnostic({ state: 'error', pageSize: size, offset: offset, count: items.length, name: err && err.name || 'UnknownError', detail: err && err.message || '' });
      finish({ message: err && err.name === 'SecurityError' ? 'La TV no permite a esta aplicación consultar los canales.' : 'No se ha podido cargar la lista de canales. Puedes reintentar.', detail: err && err.name || '' });
    }
    var finish = bounded(function (err, list) { stopped = true; done(err, list); }, 15000);
    try { channelAPI = window.tizen && window.tizen.tvchannel; }
    catch (err) { fail(err); return; }
    if (!channelAPI || typeof channelAPI.getChannelList !== 'function') { fail({ name: 'NotSupportedError', message: 'TVChannel no está disponible.' }); return; }
    saveChannelDiagnostic({ state: 'loading', pageSize: size, offset: 0, count: 0 });
    function page() {
      if (stopped) return;
      try { channelAPI.getChannelList(function (list) {
        if (stopped) return;
        if (!Array.isArray(list)) { fail({ name: 'InvalidResult', message: 'Respuesta de canales no válida.' }); return; }
        var added = 0;
        list.forEach(function (channel) {
          var key = [channel.major, channel.minor || 0, channel.sourceID || '', channel.programNumber || ''].join(':');
          if (!seen[key]) { seen[key] = true; items.push(channel); added++; }
        });
        offset += list.length;
        if (list.length < size || !added || offset >= 1500) {
          saveChannelDiagnostic({ state: 'loaded', pageSize: size, offset: offset, count: items.length, partial: list.length >= size && (!added || offset >= 1500) });
          finish(null, items); return;
        }
        saveChannelDiagnostic({ state: 'loading', pageSize: size, offset: offset, count: items.length });
        setTimeout(page, 0);
      }, fail, 'ALL', offset, size); }
      catch (err) { fail(err); }
    }
    page();
  }
  function tuneChannel(channel, done) {
    var finish = bounded(done, 12000), option = {};
    function fail(err) {
      try { if (window.localStorage) window.localStorage.setItem('cleanframe.tune.diagnostic', JSON.stringify({ major: channel && channel.major, error: err && err.name, detail: err && err.message })); } catch (storageError) { /* Diagnostic only. */ }
      finish({ message: 'No se ha podido sintonizar este canal.', detail: err && (err.message || err.name) || '' });
    }
    try {
      if (!window.tizen || !window.tizen.tvchannel || typeof window.tizen.tvchannel.tune !== 'function') { unavailable(finish); return; }
      if (!channel || typeof channel.major !== 'number') { fail({ name: 'InvalidChannel' }); return; }
      ['major', 'minor', 'ptc', 'programNumber', 'sourceID', 'transportStreamID', 'originalNetworkID', 'lcn', 'antennaMode', 'channelType'].forEach(function (key) { if (channel[key] !== undefined && channel[key] !== null) option[key] = channel[key]; });
      if (option.minor === undefined) option.minor = 0;
      window.tizen.tvchannel.tune(option, {
        onsuccess: function (selected) {
          if (selected && typeof selected.major === 'number' && selected.major !== channel.major) { fail({ name: 'DifferentChannel', message: 'La TV ha seleccionado otro canal.' }); return; }
          finish(null);
        },
        onnosignal: function () { finish({ message: 'Este canal no tiene señal.' }); },
        onprograminforeceived: function () { /* Programme information is not a tuning acknowledgement. */ }
      }, fail, 'MAIN');
    } catch (err) { fail(err); }
  }
  function store(done) { launchApp('org.volt.apps', done); }
  function launchApp(id, done) {
    if (!api()) { unavailable(done); return; }
    var finish = bounded(done);
    try { api().launch(id, function () { finish(null); }, function (err) { finish(failure(err)); }); }
    catch (err) { finish(failure(err)); }
  }
  function launch(brand, done) {
    if (!IDS[brand]) { done({message: 'Esta aplicación no tiene un destino de apertura.'}); return; }
    launchApp(IDS[brand], done);
  }
  function art(done) {
    if (!api()) { unavailable(done); return; }
    var finish = bounded(done);
    try {
      var data = [new tizen.ApplicationControlData('mode', ['fullscreen']), new tizen.ApplicationControlData('requester', ['mobile'])];
      var control = new tizen.ApplicationControl('http://tizen.org/appcontrol/operation/default', null, null, null, data);
      api().launchAppControl(control, 'org.tizen.art-app', function () { finish(null); }, function (err) { finish(failure(err)); });
    } catch (err) { finish(failure(err)); }
  }
  function home(done) { launchApp('com.samsung.tv.csfs', done); }
  // This panel was opened and visually confirmed on the bedroom S93D.
  function settings(done) { launchApp('com.samsung.tv.quicksetting', done); }
  function apps(done) {
    if (!api()) { unavailable(done); return; }
    // Large installed catalogues can take longer than a launch response.
    var finish = bounded(done, 20000);
    try {
      api().getAppsInfo(function (list) {
        var known = {}, seen = {}, result = [], self = selfId();
        Object.keys(IDS).forEach(function (brand) { known[IDS[brand]] = brand; });
        list.forEach(function (a) {
          var brand = known[a.id] || EXTRA_BRANDS[a.id] || nameBrand(a.name);
          var primary = !!known[a.id], stream = STREAMING.indexOf(a.id) >= 0;
          var consumer = !!brand || /^[A-Za-z0-9]{10}\.[A-Za-z0-9_-]+$/.test(a.id) || CONSUMER_SYSTEM.indexOf(a.id) >= 0;
          if (a.id === self || INTERNAL.indexOf(a.id) >= 0 || seen[a.id] || !a.name || (!primary && !stream && (!a.show || !consumer))) return;
          if (!primary && /(?:service|worker|preview|promotion|plugin|launcher|test|sdk|^ep[ -]|factory|daemon)/i.test(a.name + ' ' + a.id)) return;
          if (/-dummy$/.test(a.id) || a.id === 'com.samsung.tv.cobalt-yt') return;
          seen[a.id] = true;
          result.push({ appId: a.id, name: a.name, brand: brand, icon: a.iconPath || '', rank: primary ? Object.keys(IDS).indexOf(known[a.id]) : (stream ? 20 : 30) });
        });
        result.sort(function (a, b) { return a.rank - b.rank || a.name.toLowerCase().localeCompare(b.name.toLowerCase()); });
        finish(null, result);
      }, function (err) { finish(failure(err)); });
    } catch (err) { finish(failure(err)); }
  }
  window.FrameDevice = { programs: programs, channelDiagnostic: channelDiagnostic, store: store, previewTV: previewTV, hidePreview: hidePreview, channels: channels, tuneChannel: tuneChannel, liveTV: liveTV, launch: launch, launchApp: launchApp, art: art, home: home, settings: settings, apps: apps, sources: sources, setSource: setSource, cancelSource: cancelSource };
}());
