/* CleanFrame Home. Static materials, local preferences and public Tizen app controls. */
(function () {
  'use strict';

  /* ---------- Bundled data ---------- */
  var ASSETS = 'assets/', ICONS = ASSETS + 'icons/', WP = ASSETS + 'wallpapers/';
  var DEFAULT_HOME_COUNT = 9, SCRIM_Y = 560, HOME_EDGE = 48;
  var DOCK_MODES = { both: { tw: 288, th: 200, pitch: 296 }, text: { tw: 288, th: 104, pitch: 296 }, icons: { tw: 176, th: 144, pitch: 184 } };
  var GRID_ROW = 240, GRID_COL = 344, COLS = 5;
  var ED_ROW = 80, ED_SEP = 56, ED_VIEW = 752;
  var PH_TOP = 220, PH_PITCH = 128, PH_FULL = 5, PH_HEIGHT = 944, PH_COMPACT_TOP = 144, PH_COMPACT_PITCH = 88, PH_COMPACT_VISIBLE = 9;
  var WALL_VISIBLE = 6, WALL_ROW = 92, WALL_DELAY = 200;
  var KEYS = { 37: 'left', 38: 'up', 39: 'right', 40: 'down', 13: 'ok', 27: 'back', 8: 'back', 10009: 'back', 461: 'back' };
  var LAST = 'Inicio necesita al menos un acceso';

  var PRIMARY_APPS = [
    { id: 'stremio', name: 'Stremio', mark: true, appId: 'IkWsFHtOY9.Stremio' },
    { id: 'netflix', name: 'Netflix', mark: true, appId: 'org.tizen.netflix-app' },
    { id: 'disneyplus', name: 'Disney+', mark: true, appId: 'MCmYXNxgcu.DisneyPlus' },
    { id: 'youtube', name: 'YouTube', mark: true, appId: '9Ur5IzDKqV.TizenYouTube' },
    { id: 'appletv', name: 'Apple TV', mark: true, appId: 'com.samsung.tv.aria-video' },
    { id: 'primevideo', name: 'Prime Video', mark: true, appId: 'org.tizen.primevideo' },
    { id: 'abciview', name: 'ABC iview', mark: true, appId: 'mWK87Xghap.ABCiview' },
    { id: 'sbs', name: 'SBS On Demand', mark: true, appId: 'OyE7OuxlUi.SBSOnDemand' },
    { id: 'applemusic', name: 'Apple Music', mark: true, appId: 'org.tizen.apple.apple-music' }
  ];
  var LIVE_ID = 'tv.live';
  var BRAND_MARKS = ['stremio', 'netflix', 'disneyplus', 'youtube', 'appletv', 'primevideo', 'abciview', 'sbs', 'applemusic', 'hbomax', 'spotify', 'tubi', '3cat', 'skyshowtime', 'atresplayer', 'crunchyroll', 'smarttvclub'];
  var PRIMARY = PRIMARY_APPS.map(function (a) { return a.id; }), APPS = PRIMARY_APPS.slice(), ALPHA = [];
  var WALLS = window.CleanFrameWallpapers || [{ id: 'cine-series-oled-cine-noche', name: 'Consolas · Noche', tone: 'dark', ut: { tr: 'light', br: 'light' }, frostVeil: .12 }];
  var PACKS = window.CleanFrameWallpaperPacks;
  var WALL_ENGINE = window.CleanFrameWallpaperEngine.create(PACKS);
  function wallpaperNow() { return QA.now ? new Date(QA.now()) : new Date(); }
  function resolveWallpaper(c, advance) { return WALL_ENGINE.resolve(c, wallpaperNow(), advance); }
  function wallpaperChoices(t) { return t.items; }
  function packName() { return WALL_ENGINE.pack(S.c.pack).name; }
  function timeLabel(minutes) { return ('0' + Math.floor(minutes / 60)).slice(-2) + ':' + ('0' + minutes % 60).slice(-2); }
  var ADAPTIVE_INK = window.CleanFrameAdaptiveInk || {};
  WALLS.forEach(function (w) { w.ut = w.ut || { tr: 'light', br: 'light' }; w.frostVeil = w.frostVeil || .12; });
  var MODES = [
    { id: 'fixed', name: 'Fija', min: 0 }, { id: 'open', name: 'Al abrir Inicio', min: 0 },
    { id: '5', name: 'Cada 5 minutos', min: 5 }, { id: '15', name: 'Cada 15 minutos', min: 15 },
    { id: '60', name: 'Cada hora', min: 60 }
  ];
  var KEY = 'cleanframe.home.v1', storageOk = true, catalog = { loading: false, loaded: false, error: null, request: 0, revision: 0 };
  var QA = window.ShoreQA = { minuteMs: window.ShoreQA && window.ShoreQA.minuteMs || 60000, now: window.ShoreQA && window.ShoreQA.now };
  var FONTS = {
    manrope: { name: 'Manrope', family: 'Manrope', display: 600, ui: 500, clock: 500 },
    montreal: { name: 'Neue Montreal', family: 'Study Montreal', display: 300, ui: 400, clock: 300 },
    mori: { name: 'Mori', family: 'Study Mori', display: 200, ui: 400, clock: 200 },
    pangram: { name: 'Pangram Sans', family: 'Study Pangram', display: 300, ui: 400, clock: 300 },
    geist: { name: 'Geist', family: 'Study Geist', display: 300, ui: 400, clock: 300 },
    newsreader: { name: 'Newsreader', family: 'Study Newsreader', display: 400, ui: 400, clock: 400 }
  };
  var PRIVATE_FONTS = window.CleanFramePrivateFontIDs || [], fontMetrics = {}, unavailableFonts = {}, widthCache = {}, fontRevision = 0, fontsReady = false;
  var LOOK_VALUES = { bg: ['dark', 'light', 'photo'], layout: ['list', 'dock'], apps: ['icons', 'both', 'text'], font: Object.keys(FONTS).filter(function (id) { return id === 'manrope' || PRIVATE_FONTS.indexOf(id) >= 0; }), controls: ['icons', 'both', 'text'], focus: ['type', 'glass'], material: ['soft', 'frost', 'tint'] };
  var LOOK_NAMES = { bg: 'Fondo', layout: 'Diseño', apps: 'Aplicaciones', font: 'Fuente', controls: 'Controles de Inicio', focus: 'Selección', material: 'Material' };
  var VALUE_NAMES = { dark: 'Oscuro', light: 'Claro', photo: 'Fotografía', list: 'Lista', dock: 'Carrusel', type: 'Texto', glass: 'Cristal', soft: 'Suave', frost: 'Esmerilado', tint: 'Translúcido', icons: 'Iconos', both: 'Iconos y texto', text: 'Texto' };
  var UTIL = { live: ['TV en directo', 'tv'], inputs: ['Entradas', 'inputs'], art: ['Modo Arte', 'art'], apps: ['Todas las aplicaciones', 'apps'], arrange: ['Ordenar', 'arrange'], tvsettings: ['Ajustes TV', 'settings'], settings: ['Personalizar', 'settings'] };
  var MSG = {
    leave: { title: '¿Salir de Inicio?', line: '¿Abrir Inicio de Samsung?', note: '', actions: [['stay', 'Quedarse'], ['samsung', 'Inicio de Samsung']] }
  };
  var SVG = {
    art: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="9.8" r="1.5"/><path d="m4.5 17.5 4.5-4.5 3 3 2.5-2.5 5 5"/>',
    apps: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>',
    arrange: '<path d="M4 8.5h14M15 5.5l3 3-3 3M20 15.5H6M9 12.5l-3 3 3 3"/>',
    settings: '<path d="m9 3-.6 2.4-2 1.2L4 6l-2 3.5L3.8 11v2L2 14.5 4 18l2.4-.6 2 1.2L9 21h6l.6-2.4 2-1.2 2.4.6 2-3.5-1.8-1.5v-2L22 9.5 20 6l-2.4.6-2-1.2L15 3Z"/><circle cx="12" cy="12" r="3.2"/>',
    home: '<path d="M4 11 12 4.5l8 6.5v8a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1Z"/>',
    undo: '<path d="M9 6 5 10l4 4"/><path d="M5 10h9.5a4.5 4.5 0 0 1 0 9H11"/>',
    check: '<path d="m5.5 12.5 4 4 9-9"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    left: '<path d="m14.5 5-7 7 7 7"/>',
    right: '<path d="m9.5 5 7 7-7 7"/>',
    up: '<path d="m5 15.5 7-7 7 7"/>',
    down: '<path d="m5 8.5 7 7 7-7"/>',
    updown: '<path d="m7.5 9.5 4.5-4.5 4.5 4.5M7.5 14.5l4.5 4.5 4.5-4.5"/>',
    inputs: '<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M2 12h12m-4-4 4 4-4 4"/>',
    tv: '<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8.5 20h7"/>',
    warn: '<path d="M12 4 2.8 19.5h18.4Z"/><path d="M12 10v4.5M12 17.3v.1"/>'
  };

  /* ---------- State ---------- */
  var REDUCED_MOTION = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var S = {
    variant: 'B', geom: 'broad', c: null, stack: null,
    sel: null, selIdx: 0, lastUtil: 0, appsFocus: null, settingsFocus: 'background', appearanceFocus: 'bg', detailFocus: {},
    undo: [], removedAt: {}, note: null, err: null,
    writes: 0, failed: 0, log: [], logN: 0, lastLaunch: null, press: null,
    wallShown: null, wallPending: null, wallError: null,
    shown: null, pending: null, lookError: null, bundleKey: null, previewBundle: null, reflow: false, fontSwitch: false
  };
  var scroll = { first: 0, off: 0, photo: 0, photoArrange: 0 };
  function pick(v, list, fallback) {
    v = String(v || '').toLowerCase();
    for (var i = 0; i < list.length; i++) if (list[i].toLowerCase() === v) return list[i];
    return fallback;
  }
  function lookOf(c) { return { bg: c.bg, wall: c.wall, layout: c.layout, apps: c.apps, font: c.font, controls: c.controls, focus: c.focus, material: c.material, pack: c.pack, aspect: c.aspect, dayStart: c.dayStart, nightStart: c.nightStart }; }
  function materialApplies(c) { c = c || S.c; return c.bg === 'photo'; }

  /* ---------- Helpers ---------- */
  function app(id) { for (var i = 0; i < APPS.length; i++) if (APPS[i].id === id) return APPS[i]; return null; }
  function wall(id) { for (var i = 0; i < WALLS.length; i++) if (WALLS[i].id === id) return WALLS[i]; return null; }
  function frostClass(w) { var i = [.12, .20, .30, .36, .44].indexOf(w.frostVeil); return i > 0 ? ' fv-' + (i + 1) : ''; }
  function wallClasses(w) { return (w.daylight ? ' gaming-day' : '') + frostClass(w) + (w.listColumn ? ' lc-' + w.listColumn : '') + (w.dockQuiet ? ' db-quiet' : '') + (w.clockMist ? ' tl-mist' : ''); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function without(list, id) { return list.filter(function (x) { return x !== id; }); }
  function same(a, b) { if (a.length !== b.length) return false; for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function onHome(id) { return S.c.home.indexOf(id) >= 0; }
  function top() { return S.stack[S.stack.length - 1]; }
  function push(e) { S.stack.push(e); return e; }
  function pop() { if (S.stack.length > 1) S.stack.pop(); }
  function px(n) { return n.toFixed(2) + 'px'; }
  function icon(name, cls, underlay) {
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">'
      + (underlay ? '<g class="ut-underlay" transform="translate(0 .5)">' + SVG[name] + '</g><g class="ut-ink">' + SVG[name] + '</g>' : SVG[name]) + '</svg>';
  }
  function badge(on) {
    return on
      ? '<svg class="badge is-on" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><path class="badge-tick" d="m7.6 12.4 3 3 5.8-6.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg class="badge is-off" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
  }
  function log(text) { S.log.unshift('#' + (++S.logN) + ' ' + text); if (S.log.length > 10) S.log.pop(); }

  var maskSupport = 'webkitMaskImage' in document.documentElement.style || 'maskImage' in document.documentElement.style, markProbes = {};
  function probeMark(id) {
    if (markProbes[id]) return;
    var im = new Image(); markProbes[id] = 'loading';
    im.onload = function () { markProbes[id] = 'ok'; };
    im.onerror = function () {
      markProbes[id] = 'bad';
      Array.prototype.forEach.call(document.querySelectorAll('[data-mark="' + id + '"]'), function (el) { el.className += ' is-bad'; });
    };
    im.src = ICONS + id + '.svg';
  }
  /* Optical placement is identical for the CSS mask and the image fallback. */
  function markHtml(id, w, h, size) {
    var m = window.FrameIconMetrics && window.FrameIconMetrics[id], st;
    if (m) {
      var weight = clamp(Math.pow(0.45 / m.fill, 0.3), 0.84, 1.25);
      var k = Math.min(w / m.w, h / m.h, size * weight / Math.sqrt(m.w * m.h)), s = m.n * k;
      st = 'width:' + px(s) + ';height:' + px(s) + ';left:' + px(w / 2 - (m.x + m.w / 2) * k) + ';top:' + px(h / 2 - (m.y + m.h / 2) * k);
    } else st = 'width:' + w + 'px;height:' + h + 'px;left:0;top:0;object-fit:contain';
    probeMark(id);
    return '<span class="mark' + (markProbes[id] === 'bad' ? ' is-bad' : '') + '" data-mark="' + id + '" style="width:' + w + 'px;height:' + h + 'px">'
      + (maskSupport ? '<span class="mk" style="' + st + ';-webkit-mask-image:url(' + ICONS + id + '.svg);mask-image:url(' + ICONS + id + '.svg)"></span>' : '<img alt="" src="' + ICONS + id + '.svg" style="' + st + '">') + '</span>';
  }
  function appMark(a, w, h, size) {
    if (a.id === LIVE_ID) return markHtml('livetv', w, h, size);
    if (typeof a.sourceNumber === 'number' && inputIcons[String(a.sourceNumber)] && inputIcons[String(a.sourceNumber)] !== 'hdmi') return markHtml(inputIcons[String(a.sourceNumber)], w, h, size);
    if (typeof a.sourceNumber === 'number') return '<span class="mark" style="width:' + w + 'px;height:' + h + 'px;display:flex;align-items:center;justify-content:center">' + icon('inputs').replace('<svg ', '<svg style="width:' + size + 'px;height:' + size + 'px" ') + '</span>';
    var nameKey = String(a.name || '').toLowerCase().replace(/[^a-z0-9+]/g, '');
    var bundled = nameKey === '3cat' || nameKey === 'tv3' ? '3cat' : nameKey === 'crunchyroll' ? 'crunchyroll' : nameKey === 'smarttvclub' || nameKey === 'iptvsmarttvclub' ? 'smarttvclub' : nameKey === 'skyshowtime' ? 'skyshowtime' : nameKey === 'atresplayer' || nameKey === 'atresplayerpremium' ? 'atresplayer' : nameKey === 'disney+' || nameKey === 'disneyplus' ? 'disneyplus' : '';
    if (a.mark || bundled) return markHtml(bundled || a.brand || a.id, w, h, size);
    var words = a.name.split(/\s+/), letters = words[0].charAt(0) + (words.length > 1 ? words[1].charAt(0) : '');
    return '<span class="mark monogram' + (a.icon ? ' native-icon' : '') + '" style="width:' + w + 'px;height:' + h + 'px;font-size:' + Math.round(size * .65) + 'px"><span>' + esc(letters.toUpperCase()) + '</span>'
      + (a.icon ? '<img alt="" data-native-icon="true" src="' + esc(a.icon) + '">' : '') + '</span>';
  }
  function smallMark(a) { return appMark(a, 56, 44, 36); }
  var measureCanvas = document.createElement('canvas'), measureContext = measureCanvas.getContext('2d'), measureSpan = document.createElement('span');
  measureSpan.setAttribute('aria-hidden', 'true');
  measureSpan.style.cssText = 'position:absolute;left:-10000px;top:0;visibility:hidden;white-space:pre;font-synthesis:none;';
  document.body.appendChild(measureSpan);
  function homeFont() { return S.shown && S.shown.font || 'manrope'; }
  function fontRole(id, role, size) {
    var f = FONTS[id], serif = id === 'newsreader';
    return { family: f.family,
      weight: role === 'display' ? f.display : role === 'clock' ? f.clock : serif ? 400 : f.ui,
      opsz: serif ? role === 'display' ? 72 : role === 'clock' ? 48 : role === 'ui' && (!size || size === 28) ? 28 : 36 : 0 };
  }
  function measureFace(id, faces) {
    var result = { roles: {}, digits: [], digitCell: 0 }, roles = { display: [88, 76, 56], clock: [48], primary: [30, 32, 34, 36, 40], ui: [28, 30, 48] };
    var face = id === 'newsreader' ? faces[0][0] : null, original = face ? face.variationSettings : '', r, widths, min, max;
    Object.keys(roles).forEach(function (role) {
      result.roles[role] = {};
      // Canvas has no optical-size property. Set this face's default only while measuring;
      // CSS specifies each rendered role explicitly, and the descriptor is restored below.
      roles[role].forEach(function (size) {
        r = fontRole(id, role, size);
        if (face) face.variationSettings = r.opsz ? '"opsz" ' + r.opsz : original;
        measureContext.font = r.weight + ' ' + size + 'px "' + r.family + '"';
        var m = measureContext.measureText('H'), d = measureContext.measureText('gjpqy');
        result.roles[role][size] = { cap: m.actualBoundingBoxAscent || size * .72, ascent: m.fontBoundingBoxAscent || size * 1.066, descent: m.fontBoundingBoxDescent || size * .3, lower: d.actualBoundingBoxDescent || size * .255 };
      });
    });
    if (face) face.variationSettings = original;
    r = fontRole(id, 'clock');
    measureSpan.style.font = r.weight + ' 48px/64px "' + r.family + '"';
    measureSpan.style.letterSpacing = '0'; measureSpan.style.fontVariantNumeric = 'tabular-nums';
    measureSpan.style.fontVariationSettings = r.opsz ? '"opsz" ' + r.opsz : 'normal';
    widths = '0123456789'.split('').map(function (n) { measureSpan.textContent = n; return measureSpan.getBoundingClientRect().width; });
    min = Math.min.apply(Math, widths); max = Math.max.apply(Math, widths);
    result.digits = widths; result.digitCell = max - min > .02 ? max : 0;
    return result;
  }
  function fontChoices() {
    LOOK_VALUES.font = Object.keys(FONTS).filter(function (id) { return id === 'manrope' || PRIVATE_FONTS.indexOf(id) >= 0 && !unavailableFonts[id]; });
  }
  function retryFontFaces(id) {
    // A rejected CSS FontFace cannot load again. Recreate only that failed family's
    // rules; the displayed family's faces and the rest of the stylesheet stay intact.
    Array.prototype.forEach.call(document.styleSheets, function (sheet) {
      var rules, i, rule, family, css;
      try { rules = sheet.cssRules; } catch (e) { return; }
      if (!rules) return;
      for (i = 0; i < rules.length; i++) {
        rule = rules[i];
        if (rule.type !== 5) continue;
        family = rule.style.getPropertyValue('font-family').replace(/["']/g, '').trim();
        if (family !== FONTS[id].family) continue;
        css = rule.cssText; sheet.deleteRule(i); sheet.insertRule(css, i);
      }
    });
  }
  function loadFont(id, done) {
    var f = FONTS[id], weights = [f.display], timer, ended = false;
    if (fontMetrics[id]) { done(true); return; }
    if (!document.fonts || !document.fonts.load) { if (id === 'manrope') { fontMetrics.manrope = measureFace('manrope', []); fontsReady = true; done(true); } else done(false, 'unsupported'); return; }
    if (unavailableFonts[id]) retryFontFaces(id);
    if (id !== 'newsreader' && weights.indexOf(f.ui) < 0) weights.push(f.ui);
    function finish(ok, reason, faces) {
      if (ended) return;
      ended = true; clearTimeout(timer);
      if (ok) {
        fontMetrics[id] = measureFace(id, faces); delete unavailableFonts[id];
        // Measurements and cached markup belong to a particular loaded font.
        widthCache = {}; fontRevision++;
        if (id === 'manrope') fontsReady = true;
      } else if (reason !== 'timeout') unavailableFonts[id] = true;
      fontChoices(); done(ok, reason);
    }
    timer = setTimeout(function () { finish(false, 'timeout'); }, 3000);
    Promise.all(weights.map(function (weight) { return document.fonts.load(weight + ' 88px "' + f.family + '"'); })).then(function (faces) {
      finish(faces.every(function (list) { return list.length > 0 && list.every(function (face) { return face.status === 'loaded'; }); }), 'load', faces);
    }, function () { finish(false, 'load'); });
  }
  var baselineRecovery = false;
  function ensureFont(id, done) {
    loadFont('manrope', function (ok, reason) {
      if (!ok && id === 'manrope') {
        // The local fallback keeps Home usable if the baseline face is slow or missing.
        fontMetrics.manrope = measureFace('manrope', []); fontMetrics.manrope.fallback = true; fontsReady = true;
        done(true, reason);
        if (!baselineRecovery && document.fonts && document.fonts.ready) {
          baselineRecovery = true;
          document.fonts.ready.then(function () {
            delete fontMetrics.manrope; delete unavailableFonts.manrope;
            loadFont('manrope', function (loaded) {
              if (!loaded) { fontMetrics.manrope = measureFace('manrope', []); fontMetrics.manrope.fallback = true; fontsReady = true; }
              render();
            });
          });
        }
        return;
      }
      if (!ok || id === 'manrope') done(ok, reason); else loadFont(id, done);
    });
  }
  function fontShift(role, size) {
    var id = homeFont(), base = fontMetrics.manrope, metrics = fontMetrics[id], a, b;
    if (id === 'manrope' || !base || !metrics) return 0;
    a = base.roles[role][size]; b = metrics.roles[role][size];
    return (a.ascent - a.descent - a.cap - b.ascent + b.descent + b.cap) / 2;
  }
  function textWidth(text, size, weight, spacing, role) {
    var id = homeFont(), r = fontRole(id, role || 'ui', size), key, width;
    if (id !== 'manrope') { weight = r.weight; spacing = role === 'display' ? -size * .01 : 0; }
    key = [id, role || 'ui', text, size, weight, spacing].join('|');
    if (widthCache.hasOwnProperty(key)) return widthCache[key];
    if (r.opsz) {
      measureSpan.style.font = weight + ' ' + size + 'px "' + r.family + '"';
      measureSpan.style.fontVariationSettings = '"opsz" ' + r.opsz;
      measureSpan.style.fontVariantNumeric = 'normal'; measureSpan.style.letterSpacing = '0'; measureSpan.textContent = text;
      width = measureSpan.getBoundingClientRect().width;
    } else {
      measureContext.font = (weight || 500) + ' ' + size + 'px "' + r.family + '", Arial, sans-serif';
      width = measureContext.measureText(text).width;
    }
    width += Math.max(0, text.length - 1) * (spacing || 0);
    // Do not retain fallback measurements made before the baseline font is ready.
    if (fontMetrics[id] && !fontMetrics[id].fallback) widthCache[key] = width;
    return width;
  }
  function dockLabelSize(id) { return S.c.apps === 'text' ? (textWidth(app(id).name, 40, 600, -.8, 'primary') > 264 ? 34 : 40) : textWidth(app(id).name, 36, 500, -.8, 'primary') > 280 ? 32 : 36; }
  function reducedDockLabel(id) { return S.c.apps !== 'icons' && dockLabelSize(id) === (S.c.apps === 'text' ? 34 : 32); }
  function actionWidth(text) { return clamp(Math.ceil(textWidth(text, 30, 500, -.3) + 40), 288, 400); }
  function photoLabel(id, compact) {
    var text = app(id).name, size = compact ? 56 : 88, limit = compact ? 640 : 992, width = textWidth(text, size, 600, -1.8, 'display');
    if (!compact && width > limit) { size = 76; width = textWidth(text, size, 600, -1.8, 'display'); }
    // Newsreader's ninth compact Type row otherwise enters the lower fade by .63px.
    return { size: size, top: (compact ? 10.66 : size === 76 ? 10.36 : 9.68) + fontShift('display', size) - (compact && homeFont() === 'newsreader' ? .7 : 0), width: Math.min(limit, width), ellipsis: width > limit };
  }
  function listPlateWidth(id, compact) {
    if (S.c.apps === 'icons') return compact ? 120 : 144;
    var text = S.c.apps === 'text';
    return clamp(Math.ceil(photoLabel(id, compact).width + (text ? 84 : compact ? 156 : 184)), text ? 280 : 360, text ? compact ? 724 : 1076 : compact ? 796 : 1176);
  }

  /* Keyed children: elements persist by key so transforms animate instead of re-creating.
     Children are absolutely positioned, so DOM order never needs to change. */
  function keyed(parent, items, update) {
    var map = parent._k || (parent._k = {}), seen = {}, i, it, el, isNew, k;
    for (i = 0; i < items.length; i++) {
      it = items[i]; el = map[it.key]; isNew = !el;
      if (isNew) { el = document.createElement('div'); map[it.key] = el; }
      update(el, it, i);
      if (isNew) parent.appendChild(el);
      seen[it.key] = 1;
    }
    for (k in map) if (map.hasOwnProperty(k) && !seen[k]) { if (map[k].parentNode === parent) parent.removeChild(map[k]); delete map[k]; }
  }
  function setContent(el, sig, renderContent) {
    sig += '|' + catalog.revision + '|' + fontRevision;
    if (el._sig === sig) return;
    el.innerHTML = renderContent();
    el._sig = sig;
    Array.prototype.forEach.call(el.querySelectorAll('[data-native-icon]'), function (img) {
      function ready() { img.parentNode.classList.add('has-native-icon'); }
      function failed() { img.style.display = 'none'; img.parentNode.classList.remove('has-native-icon'); }
      img.onload = ready; img.onerror = failed;
      if (img.complete) { if (img.naturalWidth) ready(); else failed(); }
    });
  }
  function setHTML(el, html) { if (el._html !== html) { el._html = html; el.innerHTML = html; } }
  function attrs(el, z, i, action) { el.setAttribute('data-z', z); el.setAttribute('data-i', String(i)); el.setAttribute('data-action', action); }

  /* ---------- Saved preferences ---------- */
  function safeId(id) { return typeof id === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,160}$/.test(id) && ['constructor', 'prototype', '__proto__'].indexOf(id) < 0; }
  function safeIcon(path) { return typeof path === 'string' && path.length < 2048 && /^(?:\/[^\/]|file:\/\/\/|wgt-package:\/\/\/)/.test(path) ? path : ''; }
  function load() {
    var keys = [KEY, 'cleanframe.shore.v1'], raw, saved, i;
    for (i = 0; i < keys.length; i++) {
      try {
        raw = localStorage.getItem(keys[i]);
        if (!raw) continue;
        saved = JSON.parse(raw);
        if (saved && typeof saved === 'object' && !Array.isArray(saved)) return saved;
      } catch (e) { storageOk = false; }
    }
    return null;
  }
  function clean(saved) {
    var s = saved && typeof saved === 'object' ? saved : {}, modern = s.look && typeof s.look === 'object' ? s.look : s;
    var packPrefs = WALL_ENGINE.clean(s, modern.wall || s.wallpaper, wallpaperNow());
    var legacyList = s.theme === 'list', h = [], recent = [], records = Array.isArray(s.appRecords) ? s.appRecords : [];
    records.forEach(function (a) {
      if (!a || !safeId(a.id) || !safeId(a.appId) || typeof a.name !== 'string' || !a.name.trim() || app(a.id)) return;
      APPS.push({ id: a.id, appId: a.appId, name: a.name.slice(0, 160), brand: BRAND_MARKS.indexOf(a.brand) >= 0 ? a.brand : '', mark: BRAND_MARKS.indexOf(a.brand) >= 0, icon: safeIcon(a.icon) });
    });
    (Array.isArray(s.home) ? s.home : Array.isArray(s.dock) ? s.dock : []).forEach(function (id) {
      if (!safeId(id) || h.indexOf(id) >= 0) return;
      if (!app(id) && id.indexOf('.') > 0) APPS.push({ id: id, appId: id, name: id.split('.').pop(), mark: false });
      if (app(id)) h.push(id);
    });
    h = h.filter(function (id) { return ALPHA.indexOf(id) >= 0; });
    if (!h.length) h = ALPHA.filter(function (id) { return id !== LIVE_ID && !sourceShortcut(app(id)); }).slice(0, DEFAULT_HOME_COUNT);
    (Array.isArray(s.recent) ? s.recent : []).forEach(function (id) { if (safeId(id) && app(id) && ALPHA.indexOf(id) >= 0 && h.indexOf(id) < 0 && recent.indexOf(id) < 0 && recent.length < 5) recent.push(id); });
    return {
      bg: pick(modern.bg, LOOK_VALUES.bg, legacyList ? 'dark' : 'photo'), layout: pick(modern.layout, LOOK_VALUES.layout, legacyList ? 'list' : 'dock'),
      apps: pick(modern.apps, LOOK_VALUES.apps, legacyList ? 'text' : 'both'), controls: pick(modern.controls, LOOK_VALUES.controls, 'both'),
      focus: pick(modern.focus, LOOK_VALUES.focus, legacyList ? 'type' : 'glass'), material: pick(modern.material, LOOK_VALUES.material, 'soft'),
      font: pick(modern.font, LOOK_VALUES.font, 'manrope'), wall: packPrefs.wall,
      pack: packPrefs.pack, aspect: packPrefs.aspect, dayStart: packPrefs.dayStart, nightStart: packPrefs.nightStart,
      home: h, recent: recent, lastApp: h.indexOf(s.lastApp) >= 0 ? s.lastApp : h[0],
      mode: pick(s.mode, MODES.map(function (m) { return m.id; }), 'fixed')
    };
  }
  function serialise(c) {
    var out = {};
    Object.keys(c).forEach(function (key) { out[key] = c[key]; });
    out.availableApps = ALPHA.slice(); out.version = 3; out.wallpaperPacksVersion = 1; out.bedroomDefaultsVersion = 3; out.look = lookOf(c); out.dock = c.home.slice(); out.wallpaper = c.wall;
    out.theme = c.layout === 'list' ? 'list' : 'shore';
    out.appRecords = [];
    ALPHA.concat(c.home, c.recent).forEach(function (key) {
      var a = app(key);
      if (a && !out.appRecords.some(function (r) { return r.id === key; })) out.appRecords.push({ id: a.id, appId: a.appId, name: a.name, brand: a.brand || '', icon: a.icon || '', sourceNumber: a.sourceNumber, sourceName: a.sourceName });
    });
    return out;
  }
  function initialise() {
    var saved = load(), initial; S.c = clean(saved); initial = next(S.c.home.slice(), S.c.recent.slice());
    // Apply the bedroom starting photo once; later choices remain saved.
    if (saved && !saved.wallpaperPacksVersion && (saved.bedroomDefaultsVersion || 0) < 2) { initial.bg = 'photo'; initial.wall = 'cine-series-oled-cine-noche'; initial.mode = 'fixed'; }
    S.stack = [{ id: 'home', f: { zone: 'apps', u: 0 } }];
    S.sel = S.c.lastApp; S.selIdx = S.c.home.indexOf(S.sel);
    initial.wall = resolveWallpaper(initial, !!(saved && saved.wallpaperPacksVersion && initial.mode === 'open'));
    // Keep the old schema keys alongside the builder values for in-place updates.
    try { localStorage.setItem(KEY, JSON.stringify(serialise(initial))); S.c = initial; storageOk = true; } catch (e) { storageOk = false; }
  }
  function clearSession() { S.undo = []; S.removedAt = {}; S.note = null; S.err = null; }
  function begin() { S.note = null; }
  function next(home, recent) { var c = lookOf(S.c); c.home = home; c.recent = recent; c.lastApp = S.c.lastApp; c.mode = S.c.mode; return c; }
  function snap() { return { home: S.c.home.slice(), recent: S.c.recent.slice() }; }
  function pushRecent(list, id) { return [id].concat(without(list, id)).slice(0, 5); }
  function write(c, label) {
    try { localStorage.setItem(KEY, JSON.stringify(serialise(c))); }
    catch (e) { storageOk = false; S.failed++; S.err = label; log('Not saved: ' + label); return false; }
    if (c.wall !== S.c.wall || c.mode !== S.c.mode || c.pack !== S.c.pack) resetRotation();
    storageOk = true; S.c = c; S.writes++; S.err = null; log('Saved: ' + label);
    return true;
  }
  function errText(lifted) {
    return 'No se pudo guardar. No se ha cambiado nada.';
  }
  function statusHtml(def, lifted) {
    if (S.err) return '<span class="warn error-chip">' + esc(errText(lifted)) + '</span>';
    return esc(S.note || def);
  }

  function ensureSel() {
    var h = S.c.home, i;
    if (!h.length) { S.sel = null; return -1; }
    i = h.indexOf(S.sel);
    if (i < 0) { i = clamp(S.selIdx, 0, h.length - 1); S.sel = h[i]; }
    S.selIdx = i;
    return i;
  }
  function setSel(id) { S.sel = id; S.selIdx = S.c.home.indexOf(id); }

  /* Membership and order operations shared by B and C. A works on slots (below). */
  function homeRemove(id) {
    var a = app(id), i = S.c.home.indexOf(id), before = snap(), h;
    if (i < 0) return false;
    if (S.c.home.length <= 1) { S.note = LAST; return false; }
    h = S.c.home.slice(); h.splice(i, 1);
    if (!write(next(h, pushRecent(S.c.recent, id)), 'Quitar ' + a.name + ' de Inicio')) return false;
    S.removedAt[id] = i;
    S.undo.push({ label: 'Quitar ' + a.name, snap: before });
    return true;
  }
  function homeAdd(id) {
    var a = app(id), before = snap(), h = S.c.home.slice(), at;
    if (!a || h.indexOf(id) >= 0) return false;
    at = S.removedAt.hasOwnProperty(id) ? Math.min(S.removedAt[id], h.length) : h.length;
    h.splice(at, 0, id);
    if (!write(next(h, without(S.c.recent, id)), 'Añadir ' + a.name + ' a Inicio')) return false;
    S.undo.push({ label: 'Añadir ' + a.name, snap: before });
    return true;
  }
  function homeMove(order, id, before) {
    var a = app(id);
    if (!write(next(order, S.c.recent.slice()), 'Mover ' + a.name)) return false;
    S.undo.push({ label: 'Mover ' + a.name, snap: before });
    return true;
  }
  function undoLast(arr) {
    var u = S.undo[S.undo.length - 1];
    if (!u) { S.note = 'No hay cambios que deshacer'; return false; }
    if (!write(next(u.snap.home.slice(), u.snap.recent.slice()), 'Deshacer ' + u.label)) return false;
    S.undo.pop();
    S.note = 'Deshecho: ' + u.label + '.';
    return true;
  }
  function undoLabel() { var u = S.undo[S.undo.length - 1]; return u ? u.label : ''; }
  function undoCaption() { var label = undoLabel(); return label ? 'Deshacer ' + label.charAt(0).toLowerCase() + label.slice(1) : 'No hay cambios que deshacer'; }
  function editStatus(hint, move) {
    if (S.err) return statusHtml('', !!move);
    if (S.note === LAST) return '<span class="warn">' + esc(S.note) + '</span>';
    if (hint === LAST) return '<span class="warn">' + esc(hint) + '</span>';
    return esc(move || hint || S.note || '');
  }

  var busy = false, busyTimer = 0;
  function release() { busy = false; clearTimeout(busyTimer); S.press = null; }
  function message(title, line, note) {
    push({ id: 'message', msg: 'error', content: { title: title, line: line, note: note || '', actions: [['back', 'Volver']] }, f: { b: 0 } });
  }
  function perform(title, run) {
    if (busy) return;
    busy = true; busyTimer = setTimeout(release, 10000);
    run(function (err) {
      release();
      if (err) message(title, err.message || 'La TV no pudo abrir esta pantalla.', err.detail || '');
      render(); syncRotation();
    });
  }
  function launch(id) {
    var a = app(id), c;
    if (!a || busy) return;
    if (S.c.home.indexOf(id) >= 0) { c = next(S.c.home.slice(), S.c.recent.slice()); c.lastApp = id; write(c, 'Última aplicación'); }
    S.press = id; S.lastLaunch = a.name;
    if (id === LIVE_ID) { openLiveTV(); return; }
    perform(a.name, function (done) {
      if (typeof a.sourceNumber === 'number') FrameDevice.setSource(a.sourceNumber, done);
      else FrameDevice.launchApp(a.appId, done);
    });
  }
  function ensureLiveShortcut() {
    var a = app(LIVE_ID);
    if (!a) { a = { id: LIVE_ID }; APPS.push(a); }
    a.appId = LIVE_ID; a.name = 'TV en directo'; a.mark = true; a.brand = 'livetv';
    if (ALPHA.indexOf(LIVE_ID) < 0) ALPHA.push(LIVE_ID);
  }
  function sourceShortcut(record) {
    return record && typeof record.sourceNumber === 'number' && isFinite(record.sourceNumber) && record.sourceNumber >= 0 && Math.floor(record.sourceNumber) === record.sourceNumber && record.id === 'hdmi.' + record.sourceNumber;
  }
  function refreshCatalog() {
    var request, oldFocus, pending = 2, appError, sourceError, entries = [], inputs = [];
    if (catalog.loading) return;
    request = ++catalog.request; catalog.loading = true; catalog.error = null;
    function finish() {
      if (request !== catalog.request || --pending) return;
      catalog.loading = false;
      oldFocus = top().id === 'apps' ? ALPHA[top().f.i] : null;
      var previous = ALPHA.slice();
      ALPHA = previous.filter(function (id) { return app(id) && (sourceShortcut(app(id)) ? !!sourceError : !!appError); });
      if (!appError) entries.forEach(function (entry) {
        var id = PRIMARY.indexOf(entry.brand) >= 0 ? entry.brand : entry.appId, a;
        if (id === LIVE_ID || !safeId(id) || !safeId(entry.appId) || id.indexOf('hdmi.') === 0 || ALPHA.indexOf(id) >= 0) return;
        a = app(id);
        if (!a) { a = { id: id }; APPS.push(a); }
        a.appId = entry.appId; a.brand = BRAND_MARKS.indexOf(entry.brand) >= 0 ? entry.brand : ''; a.mark = !!a.brand;
        a.icon = safeIcon(entry.icon);
        a.name = PRIMARY.indexOf(id) >= 0 ? PRIMARY_APPS[PRIMARY.indexOf(id)].name : String(entry.name).slice(0, 160);
        ALPHA.push(id);
      });
      if (!sourceError) inputs.forEach(function (input) {
        var record = { id: 'hdmi.' + input.number, sourceNumber: input.number }, a;
        if (!sourceShortcut(record) || ALPHA.indexOf(record.id) >= 0) return;
        a = app(record.id);
        if (!a) { a = record; APPS.push(a); }
        a.sourceNumber = input.number; a.appId = record.id; a.sourceName = input.name || 'HDMI ' + input.number; a.name = inputLabel(input); a.mark = false;
        ALPHA.push(a.id);
      });
      ensureLiveShortcut();
      ALPHA.sort(function (a, b) {
        var aa = app(a), bb = app(b), ah = sourceShortcut(aa) ? 2 : aa.id === LIVE_ID ? 1 : 0, bh = sourceShortcut(bb) ? 2 : bb.id === LIVE_ID ? 1 : 0;
        if (ah !== bh) return ah - bh;
        return ah === 2 ? aa.sourceNumber - bb.sourceNumber : aa.name.toLowerCase().localeCompare(bb.name.toLowerCase());
      });
      catalog.loaded = !appError || catalog.loaded; catalog.error = appError ? appError.message || 'No se pudieron consultar las aplicaciones instaladas.' : null; catalog.revision++;
      var kept = S.c.home.filter(function (id) { return ALPHA.indexOf(id) >= 0; });
      if (!kept.length) kept = ALPHA.filter(function (id) { return id !== LIVE_ID && !sourceShortcut(app(id)); }).slice(0, DEFAULT_HOME_COUNT);
      var current = next(kept, S.c.recent.filter(function (id) { return ALPHA.indexOf(id) >= 0; }));
      if (kept.indexOf(current.lastApp) < 0) current.lastApp = kept[0] || null;
      write(current, 'Aplicaciones y entradas');
      if (top().id === 'apps' && oldFocus && ALPHA.indexOf(oldFocus) >= 0) top().f.i = ALPHA.indexOf(oldFocus);
      norm(); render();
    }
    FrameDevice.apps(function (err, list) { appError = err; entries = list || []; finish(); });
    FrameDevice.sources(function (err, list) { sourceError = err; inputs = list || []; finish(); });
  }

  /* ---------- Navigation targets ---------- */
  // Bedroom OLED S93D: native Art Mode is specific to The Frame.
  function utils() { return ['live', 'inputs', 'apps', 'settings', 'tvsettings']; }
  /* prev/next run along the apps; out goes to the controls, inn comes back (or to a per-app action). */
  function axes() {
    var v = S.c.layout === 'list';
    return { prev: v ? 'up' : 'left', next: v ? 'down' : 'right', out: v ? 'right' : 'up', inn: v ? 'left' : 'down' };
  }
  function utilAction(u) {
    if (u === 'live') openLiveTV();
    else if (u === 'tvsettings') perform('Ajustes de la TV', FrameDevice.settings);
    else if (u === 'inputs') openInputs();
    else if (u === 'art') perform('Modo Arte', FrameDevice.art);
    else if (u === 'apps') openApps();
    else openSettings();
  }
  function addAppsRoute() { openEditor('home'); }
  function openSettings() { push({ id: 'settings', f: { id: S.settingsFocus } }); }
  function openAppearance(group) {
    var axis = { background: 'bg', layout: 'layout', typography: 'font', focus: 'focus' }[group];
    var action = S.detailFocus[group] || (axis ? 'choice.' + axis + '.' + S.c[axis] : group === 'rotation' ? 'rotation.' + S.c.mode : 'samsung.home');
    push({ id: 'appearance', group: group, f: { action: action } });
  }
  function openMessage(key) { push({ id: 'message', msg: key, f: { b: 0 } }); }
  function openApps() {
    var e = { id: 'apps', mode: 'browse', top: 0, f: { zone: 'grid', i: Math.max(0, ALPHA.indexOf(S.appsFocus)), h: 0 } };
    push(e); refreshCatalog(); return e;
  }
  function openEditor(origin) {
    var i = ensureSel();
    clearSession();
    refreshCatalog();
    push({ id: 'editor', origin: origin, lifted: null, top: 0, otherReturn: { id: otherList()[0] || null, index: 0, top: 0 }, f: { zone: S.c.home.length ? 'home' : 'other', i: Math.max(0, i), part: 'name', h: 1, j: 0 } });
  }
  function openWallpaper() {
    var items = WALL_ENGINE.pack(S.c.pack).scenes.map(function (scene) { return wall(scene[WALL_ENGINE.variant(S.c, wallpaperNow())]); });
    var i = Math.max(0, items.map(function (w) { return w.id; }).indexOf(S.c.wall));
    S.err = null; S.wallError = null;
    push({ id: 'wallpaper', items: items, i: i, top: clamp(i - 2, 0, Math.max(0, items.length - WALL_VISIBLE)), f: { zone: 'photo' },
      previewTimer: 0, previewDue: null, applyPending: null, failedId: null, failedApply: false, retryBundle: null });
  }
  function isSettingsDetail(t) { return t.id === 'appearance' || t.id === 'wallpaper'; }

  var V = {};

  /* ---------- Home (browse) ---------- */
  V.home = {
    key: function (t, k) {
      var f = t.f, h = S.c.home, U = utils(), x = axes(), i = ensureSel();
      if (S.c.layout === 'list') { listHomeKey(t, k, i, U); return; }
      if (f.zone === 'util') {
        f.u = clamp(f.u, 0, U.length - 1);
        if (k === x.prev && f.u > 0) f.u--;
        else if (k === x.next && f.u < U.length - 1) f.u++;
        else if (k === x.inn || k === 'back') f.zone = 'apps';
        else if (k === 'ok') { S.lastUtil = f.u; utilAction(U[f.u]); return; }
        S.lastUtil = f.u;
        return;
      }
      f.zone = 'apps';
      if (k === x.out) { f.zone = 'util'; f.u = clamp(S.lastUtil, 0, U.length - 1); }
      else if (k === 'back') openMessage('leave');
      else if (!h.length) { if (k === 'ok') addAppsRoute(); }
      else if (k === x.prev && i > 0) setSel(h[i - 1]);
      else if (k === x.next && i < h.length - 1) setSel(h[i + 1]);
      else if (k === 'ok') launch(S.sel);
    },
    point: function (t, z, i) {
      if (z === 'util') { t.f.zone = 'util'; t.f.u = i; S.lastUtil = i; }
      else if (z === 'app') { t.f.zone = 'apps'; setSel(S.c.home[i]); }
      else if (z === 'empty') t.f.zone = 'apps';
      else return;
      this.key(t, 'ok');
    }
  };
  function listHomeKey(t, k, i, U) {
    var f = t.f, h = S.c.home;
    if (f.zone === 'util') {
      f.u = clamp(f.u, 0, U.length - 1);
      if (k === 'up' && f.u > 0) f.u--;
      else if (k === 'down' && f.u < U.length - 1) f.u++;
      else if (k === 'left' || k === 'back') f.zone = 'apps';
      else if (k === 'ok') { S.lastUtil = f.u; utilAction(U[f.u]); return; }
      S.lastUtil = f.u;
      return;
    }
    f.zone = 'apps';
    if (k === 'up' && i > 0) setSel(h[i - 1]);
    else if (k === 'right') { f.zone = 'util'; f.u = clamp(S.lastUtil, 0, U.length - 1); }
    else if (k === 'down' && i < h.length - 1) setSel(h[i + 1]);
    else if (k === 'back') openMessage('leave');
    else if (k === 'ok') { if (h.length) launch(S.sel); else addAppsRoute(); }
  }

  /* ---------- Wallpaper child: focus previews, activation applies ---------- */
  function cancelWallpaperTimer(t) {
    clearTimeout(t.previewTimer); t.previewTimer = 0; t.previewDue = null;
  }
  function failWallpaper(t, id, apply, bundle) {
    t.applyPending = null; t.failedId = id; t.failedApply = apply; t.retryBundle = bundle || null;
    restoreLook();
    if (!bundle) S.wallError = id;
  }
  function applyWallpaper(t, prepared) {
    var w = wallpaperChoices(t)[t.i], c, bundle = prepared || S.previewBundle;
    if (!prepared && (S.wallPending || t.previewDue || S.wallShown !== w.id || S.wallError)) {
      t.applyPending = w.id;
      if (t.previewDue || S.wallPending !== w.id) { cancelWallpaperTimer(t); loadWallpaperPreview(t); }
      return;
    }
    t.applyPending = null;
    if (w.id === S.c.wall) { S.err = null; t.failedId = null; t.failedApply = false; t.retryBundle = null; return; }
    if (!bundle || bundle.key !== bundleKey({ wall: w.id, material: S.c.material })) { t.applyPending = w.id; loadWallpaperPreview(t); return; }
    c = next(S.c.home.slice(), S.c.recent.slice()); c.wall = w.id;
    if (!write(c, 'Wallpaper ' + w.name)) { failWallpaper(t, w.id, true, bundle); return; }
    installBundle(bundle, c); committedBundle = bundle; S.previewBundle = null;
    t.failedId = null; t.failedApply = false; t.retryBundle = null;
  }
  function loadWallpaperPreview(t) {
    var id = wallpaperChoices(t)[t.i].id;
    cancelWallpaperTimer(t);
    showWall(id, function (ok) {
      if (top() !== t || wallpaperChoices(t)[t.i].id !== id) return;
      if (!ok) failWallpaper(t, id, t.applyPending === id, null);
      else if (t.applyPending === id) applyWallpaper(t);
      render(); syncRotation();
    });
  }
  function previewWallpaper(t, index, apply, immediate) {
    var id, target;
    cancelWallpaperTimer(t); cancelLook();
    t.i = index; t.f.zone = 'photo'; id = wallpaperChoices(t)[index].id;
    t.applyPending = apply ? id : null; t.failedId = null; t.failedApply = false; t.retryBundle = null;
    S.err = null; S.wallError = null;
    if (id === S.c.wall && committedBundle) {
      installBundle(committedBundle, S.c, true); S.previewBundle = null;
      if (apply) applyWallpaper(t);
      return;
    }
    if (S.wallShown === id && S.previewBundle && S.previewBundle.key === bundleKey({ wall: id, material: S.c.material })) {
      if (apply) applyWallpaper(t);
      return;
    }
    if (apply || immediate) { loadWallpaperPreview(t); return; }
    target = lookOf(S.c); target.wall = id;
    S.pending = { patch: { wall: id }, target: target, row: 'bg', preview: true, transient: false, deferred: true };
    t.previewDue = id;
    t.previewTimer = setTimeout(function () { if (top() === t && wallpaperChoices(t)[t.i].id === id) loadWallpaperPreview(t); }, WALL_DELAY);
  }
  function retryWallpaper(t) {
    var apply = t.failedApply, bundle = t.retryBundle;
    t.f.zone = 'photo';
    if (bundle && apply) applyWallpaper(t, bundle);
    else previewWallpaper(t, t.i, apply, true);
  }
  function closeWallpaper(t) {
    cancelWallpaperTimer(t); t.applyPending = null; S.err = null; pop(); restoreLook();
    if (top().id === 'appearance' && top().group === 'background') detailFocus(top(), { action: 'background.wallpaper' }, 0);
  }
  V.wallpaper = {
    norm: function (t) {
      t.i = clamp(t.i, 0, wallpaperChoices(t).length - 1);
      if (t.f.zone === 'retry' && !t.failedId) t.f.zone = 'photo';
      if (t.i < t.top) t.top = t.i;
      if (t.i >= t.top + WALL_VISIBLE) t.top = t.i - WALL_VISIBLE + 1;
      t.top = clamp(t.top, 0, Math.max(0, wallpaperChoices(t).length - WALL_VISIBLE));
    },
    key: function (t, k) {
      if (k === 'back') { closeWallpaper(t); return; }
      if (t.f.zone === 'back') {
        if (k === 'ok') closeWallpaper(t);
        else if (k === 'down' || k === 'right') t.f.zone = 'photo';
        return;
      }
      if (t.f.zone === 'retry') {
        if (k === 'ok') retryWallpaper(t);
        else if (k === 'up' || k === 'left') t.f.zone = 'photo';
        return;
      }
      if (k === 'left' || k === 'up' && t.i === 0) { t.nav = 0; t.applyPending = null; }
      else if (k === 'up' && t.i > 0) previewWallpaper(t, t.i - 1, false);
      else if (k === 'down' && t.i < wallpaperChoices(t).length - 1) previewWallpaper(t, t.i + 1, false);
      else if ((k === 'right' || k === 'down') && t.failedId) t.f.zone = 'retry';
      else if (k === 'ok') { if (t.retryBundle) applyWallpaper(t, t.retryBundle); else applyWallpaper(t); }
    },
    point: function (t, z, i) {
      if (z === 'wall-back') closeWallpaper(t);
      else if (z === 'wall-retry') retryWallpaper(t);
      else if (z === 'wall-choice' && i >= 0 && i < wallpaperChoices(t).length) {
        if (i === t.i) { t.f.zone = 'photo'; this.key(t, 'ok'); }
        else previewWallpaper(t, i, true);
      }
    }
  };

  /* ---------- Installed apps ---------- */
  function appsItems() { return ALPHA; }
  function appsHead() { var buttons = [['editor', 'Añadir y ordenar', '', 'home'], ['store', 'Descargar aplicaciones', '', 'apps']]; if (catalog.error) buttons.push(['retry', 'Reintentar', '', '']); return buttons; }
  V.apps = {
    sheet: true,
    norm: function (t) {
      var n = appsItems().length;
      t.f.i = clamp(t.f.i, 0, Math.max(0, n - 1));
      if (!n) t.f.zone = 'head';
      t.f.h = clamp(t.f.h || 0, 0, appsHead().length - 1);
    },
    key: function (t, k) {
      var f = t.f, items = appsItems(), n = items.length, col = f.i % COLS, row = Math.floor(f.i / COLS);
      if (k === 'back') { pop(); return; }
      if (f.zone === 'head') {
        if (k === 'down' && n) f.zone = 'grid';
        else if (k === 'left') f.h = Math.max(0, f.h - 1);
        else if (k === 'right') f.h = Math.min(appsHead().length - 1, f.h + 1);
        else if (k === 'ok') { var action = appsHead()[f.h][0]; if (action === 'retry') refreshCatalog(); else if (action === 'store') perform('Descargar aplicaciones', FrameDevice.store); else openEditor('apps'); }
        return;
      }
      if (k === 'left' && col > 0) f.i--;
      else if (k === 'right' && col < COLS - 1 && f.i < n - 1) f.i++;
      else if (k === 'down' && row < Math.ceil(n / COLS) - 1) f.i = Math.min(f.i + COLS, n - 1);
      else if (k === 'up') { if (row > 0) f.i -= COLS; else f.zone = 'head'; }
      else if (k === 'ok' && n) launch(items[f.i]);
      S.appsFocus = items[f.i] || null;
    },
    point: function (t, z, i) { if (z === 'grid') { t.f.zone = 'grid'; t.f.i = i; } else if (z === 'head') { t.f.zone = 'head'; t.f.h = i; } else return; this.key(t, 'ok'); }
  };

  /* ---------- B: two-zone Home editor ---------- */
  function otherGroups() {
    var rec = S.c.recent.filter(function (id) { return !onHome(id) && app(id); });
    return { recent: rec, rest: ALPHA.filter(function (id) { return !onHome(id) && rec.indexOf(id) < 0; }) };
  }
  function otherList() { var o = otherGroups(); return o.recent.concat(o.rest); }
  function editorCut() { return 5; }
  function editorHomeY(i) { return i * ED_ROW + (i >= editorCut() ? 24 : 0); }
  function editorOtherY(j) {
    var o = otherGroups();
    return j * ED_ROW + (o.recent.length ? ED_SEP : 0) + (o.recent.length && j >= o.recent.length ? ED_SEP : 0);
  }
  function rememberOther(t) {
    var list = otherList();
    t.otherReturn = { id: list[t.f.j] || null, index: t.f.j, top: t.top };
  }
  function returnOther(t) {
    var list = otherList(), memory = t.otherReturn, i = memory ? list.indexOf(memory.id) : -1;
    t.f.zone = 'other';
    t.f.j = i >= 0 ? i : clamp(memory ? memory.index : 0, 0, Math.max(0, list.length - 1));
    if (memory) t.top = memory.top;
  }
  function nearestHome(t, count) {
    var target = editorOtherY(t.f.j) - t.top + 36, best = 0, distance = Infinity, i, d;
    for (i = 0; i < count; i++) {
      d = Math.abs(editorHomeY(i) - (t.homeTop || 0) + 36 - target);
      if (d < distance) { best = i; distance = d; }
    }
    return best;
  }
  V.editor = {
    sheet: true,
    norm: function (t) {
      var f = t.f, nh = (t.lifted ? t.lifted.order : S.c.home).length, no = otherList().length;
      f.i = clamp(f.i, 0, Math.max(0, nh - 1));
      f.j = clamp(f.j, 0, Math.max(0, no - 1));
      if (f.zone === 'home' && !nh) f.zone = no ? 'other' : 'head';
      if (f.zone === 'other' && !no) f.zone = nh ? 'home' : 'head';
    },
    key: function (t, k) {
      var f = t.f, H = t.lifted ? t.lifted.order : S.c.home, O = otherList(), nh = H.length, no = O.length, d, tmp;
      if (t.lifted) {
        d = k === 'up' ? -1 : k === 'down' ? 1 : 0;
        if (d && f.i + d >= 0 && f.i + d < nh) { tmp = H[f.i + d]; H[f.i + d] = H[f.i]; H[f.i] = tmp; f.i += d; S.err = null; }
        else if (k === 'ok') editorPlace(t);
        else if (k === 'back') { f.i = t.lifted.from; t.lifted = null; S.err = null; }
        return;
      }
      if (k === 'back') { closeEditor(t); return; }
      if (f.zone === 'head') {
        if (k === 'left' && f.h > 0) f.h--;
        else if (k === 'right' && f.h < 1) f.h++;
        else if (k === 'down') { if (no) returnOther(t); else if (nh) f.zone = 'home'; }
        else if (k === 'ok') { begin(); if (f.h === 0) undoLast(null); else closeEditor(t); }
      } else if (f.zone === 'home') {
        if (k === 'up') { if (f.i > 0) f.i--; else f.zone = 'head'; }
        else if (k === 'down') { if (f.i < nh - 1) f.i++; }
        else if (k === 'right') { if (f.part === 'name') f.part = 'remove'; else if (no) returnOther(t); }
        else if (k === 'left') { if (f.part === 'remove') f.part = 'name'; }
        else if (k === 'ok') {
          begin();
          if (f.part === 'name') t.lifted = { id: H[f.i], from: f.i, order: H.slice(), snap: snap() };
          else editorRemove(t, H[f.i]);
        }
      } else {
        if (k === 'up') { if (f.j > 0) { f.j--; rememberOther(t); } else f.zone = 'head'; }
        else if (k === 'down') { if (f.j < no - 1) { f.j++; rememberOther(t); } }
        else if (k === 'left') { if (nh) { rememberOther(t); f.i = nearestHome(t, nh); f.zone = 'home'; f.part = 'name'; } }
        else if (k === 'ok') { begin(); editorAdd(t, O[f.j]); }
      }
    },
    point: function (t, z, i) {
      if (t.lifted) {
        if (z === 'head') this.key(t, i === 0 ? 'back' : 'ok');
        else if (z === 'name' && i === t.f.i) this.key(t, 'ok');
        return;
      }
      if (z === 'name' || z === 'remove') { t.f.zone = 'home'; t.f.i = i; t.f.part = z; }
      else if (z === 'other') { t.f.zone = 'other'; t.f.j = i; rememberOther(t); }
      else if (z === 'head') { t.f.zone = 'head'; t.f.h = i; }
      else return;
      this.key(t, 'ok');
    }
  };
  /* Focus follows the app between zones, so a repeated OK toggles the same app. */
  function editorRemove(t, id) {
    if (!homeRemove(id)) return;
    t.f.zone = 'other'; t.f.j = otherList().indexOf(id);
    S.note = app(id).name + ' está en Eliminadas recientemente. OK la restaura.';
  }
  function editorAdd(t, id) {
    rememberOther(t);
    if (!homeAdd(id)) return;
    var remaining = otherList(), at = clamp(t.otherReturn.index, 0, Math.max(0, remaining.length - 1));
    t.otherReturn.id = remaining[at] || null; t.otherReturn.index = at;
    t.f.zone = 'home'; t.f.i = S.c.home.indexOf(id); t.f.part = 'name';
    S.note = app(id).name + ' está en Inicio, posición ' + (t.f.i + 1) + '.';
  }
  function editorPlace(t) {
    var L = t.lifted;
    begin();
    if (same(L.order, S.c.home)) { t.lifted = null; return; }
    if (!homeMove(L.order.slice(), L.id, L.snap)) return;
    t.lifted = null;
    S.note = app(L.id).name + ' se ha movido a la posición ' + (t.f.i + 1) + '.';
  }
  function closeEditor() { clearSession(); pop(); }

  /* ---------- Settings, Layout and messages ---------- */
  function mode() { for (var i = 0; i < MODES.length; i++) if (MODES[i].id === S.c.mode) return MODES[i]; return MODES[0]; }
  function settingsRows() {
    var n = S.c.home.length;
    return [{ id: 'background', label: 'Fondo', value: S.c.bg === 'photo' ? packName() : VALUE_NAMES[S.c.bg] },
      { id: 'inputnames', label: 'Entradas HDMI', value: 'Cambiar nombres e iconos' },
      { id: 'layout', label: 'Diseño', value: VALUE_NAMES[S.c.layout] },
      { id: 'typography', label: 'Tipografía', value: FONTS[S.c.font].name },
      { id: 'focus', label: 'Selección', value: VALUE_NAMES[S.c.focus] + (materialApplies() ? ', ' + VALUE_NAMES[S.c.material] : '') },
      { id: 'editor', label: 'Añadir y ordenar el carrusel', value: n + (n === 1 ? ' acceso en Inicio' : ' accesos en Inicio') },
      { id: 'samsung', label: 'Samsung', value: 'Inicio y ajustes de la TV' }];
  }
  function settingsIds() { return settingsRows().map(function (r) { return r.id; }); }
  V.settings = {
    sheet: true,
    norm: function (t) { var ids = settingsIds(); if (ids.indexOf(t.f.id) < 0) t.f.id = ids[0]; },
    key: function (t, k) {
      var ids = settingsIds(), i = Math.max(0, ids.indexOf(t.f.id));
      if (k === 'up' && i > 0) i--;
      else if (k === 'down' && i < ids.length - 1) i++;
      else if (k === 'back') { pop(); return; }
      t.f.id = ids[i]; S.settingsFocus = ids[i];
      if (k === 'ok') settingsOk(ids[i]);
    },
    point: function (t, z, i, id) { if (z === 'row' && id) { t.f.id = id; this.key(t, 'ok'); } }
  };
  function settingsOk(id) {
    if (id === 'editor') openEditor('settings');
    else if (id === 'inputnames') openInputNames();
    else openAppearance(id);
  }
  var DETAIL_NAMES = { background: 'Fondo', layout: 'Diseño', typography: 'Tipografía', focus: 'Selección', rotation: 'Rotación', samsung: 'Samsung', inputs: 'Entradas', inputnames: 'Entradas HDMI', inputoptions: 'Entrada HDMI', inputicons: 'Elegir icono', packs: 'Paquetes de fondos', aspect: 'Día y noche', schedule: 'Horario día y noche' };
  function choice(axis, value, disabled) {
    return { action: axis === 'mode' ? 'rotation.' + value : 'choice.' + axis + '.' + value, axis: axis, value: value, disabled: !!disabled,
      label: axis === 'font' ? FONTS[value].name : axis === 'aspect' ? { auto: 'Automático', day: 'Día', night: 'Noche' }[value] : axis === 'pack' ? WALL_ENGINE.pack(value).name : axis === 'mode' ? MODES.filter(function (m) { return m.id === value; })[0].name : value === 'both' ? 'Ambos' : VALUE_NAMES[value] };
  }
  function detailSections(t) {
    var flat = S.c.bg !== 'photo', inactive = !materialApplies();
    function options(axis, values, disabled) { return values.map(function (value) { return choice(axis, value, disabled); }); }
    if (t.group === 'inputs') return t.inputs.length ? t.inputs.map(function (input) {
      return { id: 'hdmi-' + input.number, title: 'HDMI ' + input.number, horizontal: true, items: [
        { action: 'input.' + input.number, label: inputLabel(input), inputNumber: input.number, description: input.active ? 'Activa' : input.connected ? 'Conectada' : 'Desconectada o en reposo' }] };
    }) : [{ id: 'inputs', title: '', items: [{ action: 'inputs.retry', label: t.loading ? 'Cargando entradas…' : 'Reintentar', disabled: t.loading }], reason: t.inputError || 'La TV no ha detectado entradas HDMI.' }];
    if (t.group === 'inputnames') return [{ id: 'inputnames', title: '', items: t.inputs.length ? t.inputs.map(function (input) { return { action: 'inputconfig.' + input.number, label: inputLabel(input), description: 'HDMI ' + input.number + ' · Nombre e icono', inputNumber: input.number }; }) : [{ action: 'inputs.retry', label: t.loading ? 'Cargando entradas…' : 'Reintentar', disabled: t.loading }], reason: t.inputError || '' }];
    if (t.group === 'inputoptions') return [{ id: 'port-options', title: 'HDMI ' + t.input.number, items: [{ action: 'inputname.' + t.input.number, label: 'Cambiar nombre', description: inputLabel(t.input) }, { action: 'inputicon.' + t.input.number, label: 'Elegir icono', description: hdmiIconName(t.input.number), inputNumber: t.input.number }] }];
    if (t.group === 'inputicons') return [{ id: 'port-icons', title: 'HDMI ' + t.input.number + ' · ' + inputLabel(t.input), items: HDMI_ICONS.map(function (item) { return { action: 'inputicon.set.' + item.id, label: item.name, portIcon: item.id, inputNumber: t.input.number, iconPreview: item.id }; }), reason: t.iconError || 'El icono se aplica al carrusel y a Entradas.' }];
    if (t.group === 'background') return [
      { id: 'bg', title: 'Tipo de fondo', items: options('bg', ['photo', 'light', 'dark']) },
      { id: 'pack', title: 'Paquete', items: [{ action: 'background.packs', label: packName(), thumbnail: true, disabled: flat }] },
      { id: 'wall', title: 'Escena', items: [{ action: 'background.wallpaper', label: WALL_ENGINE.locate(S.c.wall).scene.name, disabled: flat }] },
      { id: 'aspect', title: 'Día y noche', items: [{ action: 'background.aspect', label: { auto: 'Automático', day: 'Día', night: 'Noche' }[S.c.aspect], disabled: flat }] },
      { id: 'rotation', title: 'Rotación', items: [{ action: 'background.rotation', label: mode().name, disabled: flat }] },
      { id: 'schedule', title: 'Horario automático', items: [{ action: 'background.schedule', label: 'Día ' + timeLabel(S.c.dayStart) + ' / Noche ' + timeLabel(S.c.nightStart), disabled: flat }] }

    ];
    if (t.group === 'packs') return [{ id: 'packs', title: 'Selecciona un paquete', items: PACKS.map(function (p) {
      var item = choice('pack', p.id, flat); item.description = p.scenes.length + ' escenas con día y noche'; item.thumbnailId = p.scenes[0][WALL_ENGINE.variant(S.c, wallpaperNow())]; return item;
    }), reason: 'OK aplica el paquete. Rotación y horario se conservan.' }];
    if (t.group === 'aspect') return [{ id: 'aspect', title: 'Aspecto del paquete', items: options('aspect', ['auto', 'day', 'night'], flat), reason: 'Automático usa la hora local de la TV. Día y Noche mantienen su versión fija.' }];
    if (t.group === 'schedule') return ['dayStart', 'nightStart'].map(function (key) {
      return { id: key, title: (key === 'dayStart' ? 'Día desde las ' : 'Noche desde las ') + timeLabel(S.c[key]), horizontal: true, items: [
        { action: 'schedule.' + key + '.minus', label: '− 30 min', disabled: flat },
        { action: 'schedule.' + key + '.plus', label: '+ 30 min', disabled: flat }
      ], reason: key === 'nightStart' ? 'Se guarda con OK. Las dos horas deben ser distintas.' : '' };
    });
    if (t.group === 'layout') return [
      { id: 'layout', title: 'Diseño', horizontal: true, items: options('layout', ['list', 'dock']) },
      { id: 'apps', title: 'Mostrar aplicaciones', horizontal: true, items: options('apps', ['text', 'icons', 'both']) },
      { id: 'controls', title: 'Controles de Inicio', horizontal: true, items: options('controls', ['text', 'icons', 'both']) }
    ];
    if (t.group === 'typography') return [{ id: 'font', title: '', items: options('font', LOOK_VALUES.font) }];
    if (t.group === 'focus') return [
      { id: 'focus', title: 'Estilo de selección', horizontal: true, items: options('focus', ['type', 'glass']) },
      { id: 'material', title: 'Material', horizontal: false, items: options('material', ['soft', 'frost', 'tint'], inactive),
        reason: inactive ? flat ? 'Los materiales están disponibles con un fondo fotográfico.' : 'Elige selección Cristal o diseño Carrusel para usar materiales.' : '' }
    ];
    if (t.group === 'rotation') return [{ id: 'mode', title: '', items: options('mode', MODES.map(function (m) { return m.id; }), flat),
      reason: flat ? 'Elige Fotografía en Fondo para usar la rotación.' : 'La rotación se pausa al abrir Ajustes u otro panel.' }];
    return [{ id: 'samsung', title: '', items: [
      { action: 'samsung.home', label: 'Inicio de Samsung', description: 'Abrir la pantalla de Inicio de Samsung' },
      { action: 'samsung.settings', label: 'Ajustes de la TV', description: 'Ajustes de imagen, sonido y red' },
      { action: 'samsung.inputs', label: 'Entradas', description: 'Elegir una entrada HDMI' },
      { action: 'samsung.inputnames', label: 'Entradas HDMI', description: 'Cambiar nombres e iconos de nuestros accesos' }
    ] }];
  }
  function detailRows(t) {
    var rows = [];
    detailSections(t).forEach(function (section) {
      var enabled = section.items.filter(function (item) { return !item.disabled; });
      if (section.horizontal && enabled.length) rows.push(enabled);
      else enabled.forEach(function (item) { rows.push([item]); });
    });
    if (S.lookError) rows.push([{ action: 'settings.retry', label: 'Reintentar' }]);
    if (!rows.length) rows.push([detailSections(t)[0].items[0]]);
    return rows;
  }
  function detailLocation(t) {
    var rows = detailRows(t), row = 0, column = 0;
    rows.forEach(function (items, r) { items.forEach(function (item, c) { if (item.action === t.f.action) { row = r; column = c; } }); });
    return { rows: rows, row: row, column: column, item: rows[row][column] };
  }
  function detailFocus(t, item, column) {
    t.f.action = item.action;
    if (item.action !== 'settings.back') S.detailFocus[t.group] = item.action;
    if (column !== undefined) t.f.column = column;
    if (item.axis) S.appearanceFocus = item.axis;
  }
  function applyRotation(value) {
    var c;
    if (S.c.bg !== 'photo') return;
    S.err = null; S.lookError = null;
    if (value === S.c.mode) return;
    c = next(S.c.home.slice(), S.c.recent.slice()); c.mode = value;
    if (!write(c, 'Rotación de imágenes')) S.lookError = { type: 'save', patch: { mode: value }, row: 'mode', transient: false };
  }
  function loadInputs(t) {
    t.loading = true; t.inputError = null;
    FrameDevice.sources(function (err, list) {
      if (top() !== t) return;
      t.loading = false; t.inputs = list || []; t.inputError = err ? err.message : null; after();
    });
  }
  function openInputNames() {
    openAppearance('inputnames'); var t = top(); t.inputs = []; loadInputs(t);
  }
  function openInputs() {
    openAppearance('inputs'); var t = top(); t.inputs = []; loadInputs(t);
  }
  function detailBack() { cancelLook(); S.err = null; pop(); FrameDevice.cancelSource(); }
  function detailOk(t, item) {
    var patch = {}, error = S.lookError;
    if (item.action === 'settings.back') { detailBack(); return; }
    if (item.disabled || S.pending) return;
    if (item.action === 'settings.retry') {
      if (error && error.patch[error.row] !== undefined) detailFocus(t, choice(error.row, error.patch[error.row]), 0);
      if (error && error.row === 'mode') applyRotation(error.patch.mode);
      else if (error) setLook(error.patch, { row: error.row });
    } else if (item.axis === 'mode') applyRotation(item.value);
    else if (item.axis) { patch[item.axis] = item.value; setLook(patch, { row: item.axis }); }
    else if (item.action === 'background.wallpaper') openWallpaper();
    else if (item.action === 'background.rotation') openAppearance('rotation');
    else if (item.action === 'background.packs') openAppearance('packs');
    else if (item.action === 'background.aspect') openAppearance('aspect');
    else if (item.action === 'background.schedule') openAppearance('schedule');
    else if (item.action.indexOf('schedule.') === 0) {
      var parts = item.action.split('.'), timeKey = parts[1], value = (S.c[timeKey] + (parts[2] === 'plus' ? 30 : 1410)) % 1440;
      if (value === S.c[timeKey === 'dayStart' ? 'nightStart' : 'dayStart']) value = (value + (parts[2] === 'plus' ? 30 : 1410)) % 1440;
      patch[timeKey] = value; setLook(patch, { row: timeKey });
    }
    else if (item.action === 'samsung.home') perform('Inicio de Samsung', FrameDevice.home);
    else if (item.action === 'samsung.settings') perform('Ajustes de la TV', FrameDevice.settings);
    else if (item.action === 'samsung.inputs') openInputs();
    else if (item.action === 'samsung.inputnames') openInputNames();
    else if (item.action.indexOf('inputconfig.') === 0) {
      var configPort = Number(item.action.slice(12));
      t.inputs.some(function (input) { if (input.number !== configPort) return false; openAppearance('inputoptions'); top().input = input; return true; });
    }
    else if (item.action.indexOf('inputname.') === 0) openInputName(t.input);
    else if (item.action.indexOf('inputicon.set.') === 0) saveInputIcon(t, item.action.slice(14));
    else if (item.action.indexOf('inputicon.') === 0) { openAppearance('inputicons'); top().input = t.input; }

    else if (item.action === 'inputs.retry') loadInputs(t);
    else if (item.action.indexOf('input.') === 0) perform(item.label, function (done) {
      FrameDevice.setSource(Number(item.action.slice(6)), function (err) {
        t.refreshInputs = true;
        done(top() === t && !document.hidden && !(err && err.cancelled) ? err : null);
      });
    });
  }
  V.appearance = {
    norm: function (t) {
      var rows = detailRows(t), exists = false, applied = null;
      var axis = { background: 'bg', layout: 'layout', typography: 'font', focus: 'focus', rotation: 'mode', packs: 'pack', aspect: 'aspect' }[t.group];
      rows.forEach(function (items) { items.forEach(function (item) {
        if (item.action === t.f.action) exists = true;
        if (item.axis === axis && item.value === S.c[axis]) applied = item;
        if (item.portIcon !== undefined && (inputIcons[String(t.input.number)] || 'hdmi') === item.portIcon) applied = item;
      }); });
      if (!exists) detailFocus(t, applied || rows[0][0], 0);
      if (t.f.column === undefined) t.f.column = detailLocation(t).column;
    },
    key: function (t, k) {
      var at = detailLocation(t), row = at.row, column = at.column;
      if (k === 'back') { detailBack(); return; }
      if (k === 'ok') { detailOk(t, at.item); return; }
      if (k === 'up' || k === 'down') {
        row = clamp(row + (k === 'up' ? -1 : 1), 0, at.rows.length - 1);
        column = Math.min(t.f.column || 0, at.rows[row].length - 1);
        detailFocus(t, at.rows[row][column]);
      } else if (k === 'left' || k === 'right') {
        column = clamp(column + (k === 'left' ? -1 : 1), 0, at.rows[row].length - 1);
        detailFocus(t, at.rows[row][column], column);
      }
    },
    point: function (t, z, i, action) {
      if (z !== 'detail') return;
      detailRows(t).some(function (items) { return items.some(function (item, column) {
        if (item.action !== action) return false;
        detailFocus(t, item, column); detailOk(t, item); return true;
      }); });
    }
  };
  function messageContent(t) { return t.content || MSG[t.msg]; }
  V.message = {
    sheet: true,
    key: function (t, k) {
      var A = messageContent(t).actions, a;
      if (k === 'left') t.f.b = Math.max(0, t.f.b - 1);
      else if (k === 'right') t.f.b = Math.min(A.length - 1, t.f.b + 1);
      else if (k === 'back') pop();
      else if (k === 'ok') { a = A[t.f.b][0]; pop(); if (a === 'samsung') perform('Inicio de Samsung', FrameDevice.home); }
    },
    point: function (t, z, i) { if (z === 'act') { t.f.b = i; this.key(t, 'ok'); } }
  };

  /* HDMI names are edited with a small built-in keyboard, independent of Samsung's IME. */
  var inputAliases = {}, inputIcons = {};
  var HDMI_ICONS = [{ id: 'hdmi', name: 'HDMI' }, { id: 'steam', name: 'Steam' }, { id: 'nintendoswitch', name: 'Nintendo Switch' }, { id: 'playstation5', name: 'PlayStation 5' }];
  function hdmiIconName(port) { var chosen = inputIcons[String(port)] || 'hdmi'; return HDMI_ICONS.filter(function (item) { return item.id === chosen; })[0].name; }
  function saveInputIcon(t, iconId) {
    if (!HDMI_ICONS.some(function (item) { return item.id === iconId; })) return;
    var updated = {}; Object.keys(inputIcons).forEach(function (key) { updated[key] = inputIcons[key]; });
    updated[String(t.input.number)] = iconId;
    try { localStorage.setItem('cleanframe.hdmi.icons.v1', JSON.stringify(updated)); }
    catch (err) { t.iconError = 'No se pudo guardar el icono. Se conserva el anterior. Pulsa OK para reintentar.'; return; }
    inputIcons = updated; t.iconError = '';
  }
  function inputLabel(input) { return inputAliases[String(input.number)] || input.name || 'HDMI ' + input.number; }
  function loadInputAliases() {
    try {
      var saved = JSON.parse(localStorage.getItem('cleanframe.hdmi.names.v1') || '{}');
      Object.keys(saved).forEach(function (key) { if (/^[0-9]{1,2}$/.test(key) && typeof saved[key] === 'string') inputAliases[key] = saved[key].replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, 40); });
    } catch (err) { inputAliases = {}; }
    try { var icons = JSON.parse(localStorage.getItem('cleanframe.hdmi.icons.v1') || '{}'); Object.keys(icons).forEach(function (key) { if (/^[0-9]{1,2}$/.test(key) && HDMI_ICONS.some(function (item) { return item.id === icons[key]; })) inputIcons[key] = icons[key]; }); } catch (iconError) { inputIcons = {}; }
  }
  function openInputName(input) {
    push({ id: 'hdmiName', port: input.number, value: inputLabel(input).slice(0, 40), original: input.name, upper: false, error: '', f: { zone: 'head', h: 0, row: 0, col: 0 } });
  }
  function saveInputName(t) {
    var value = t.value.replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, 40), updated = {};
    Object.keys(inputAliases).forEach(function (key) { updated[key] = inputAliases[key]; });
    if (value) updated[String(t.port)] = value; else delete updated[String(t.port)];
    try { localStorage.setItem('cleanframe.hdmi.names.v1', JSON.stringify(updated)); }
    catch (err) { t.error = 'No se pudo guardar. El nombre anterior se conserva. Puedes reintentar o cancelar.'; return; }
    inputAliases = updated;
    APPS.forEach(function (a) { if (sourceShortcut(a)) a.name = inputAliases[String(a.sourceNumber)] || a.sourceName || 'HDMI ' + a.sourceNumber; });
    pop(); refreshCatalog();
  }
  var HDMI_KEY_ROWS = ['1234567890', 'qwertyuiop', 'asdfghjklñ', 'zxcvbnm.-_'];
  function inputNameRows(t) { return t.symbols ? ['1234567890', 'áéíóúüñç¿¡', '@/+:()#&%?', '[]{}!*=,; '] : HDMI_KEY_ROWS; }
  function inputNameHead(t, i) {
    if (i === 0) saveInputName(t);
    else if (i === 1) pop();
    else { t.value = ''; t.error = ''; }
  }
  function inputNameTool(t, i) {
    if (i === 0 && t.value.length < 40) t.value += ' ';
    else if (i === 1) t.value = t.value.slice(0, -1);
    else if (i === 2) t.upper = !t.upper;
    else if (i === 3) t.value = '';
    else if (i === 4) t.symbols = !t.symbols;
    t.error = '';
  }
  V.hdmiName = {
    sheet: true,
    key: function (t, k) {
      var f = t.f, letter;
      if (k === 'back') { pop(); return; }
      if (f.zone === 'head') {
        if (k === 'left') f.h = Math.max(0, f.h - 1);
        else if (k === 'right') f.h = Math.min(2, f.h + 1);
        else if (k === 'down') f.zone = 'keys';
        else if (k === 'ok') inputNameHead(t, f.h);
      } else if (f.zone === 'tools') {
        if (k === 'left') f.col = Math.max(0, f.col - 1);
        else if (k === 'right') f.col = Math.min(4, f.col + 1);
        else if (k === 'up') { f.zone = 'keys'; f.row = 3; f.col = Math.min(f.col * 2, 9); }
        else if (k === 'ok') inputNameTool(t, f.col);
      } else {
        if (k === 'left') f.col = Math.max(0, f.col - 1);
        else if (k === 'right') f.col = Math.min(9, f.col + 1);
        else if (k === 'up') { if (f.row === 0) f.zone = 'head'; else f.row--; }
        else if (k === 'down') { if (f.row === 3) { f.zone = 'tools'; f.col = Math.min(4, Math.floor(f.col / 2)); } else f.row++; }
        else if (k === 'ok' && t.value.length < 40) { letter = inputNameRows(t)[f.row].charAt(f.col); t.value += t.upper ? letter.toUpperCase() : letter; t.error = ''; }
      }
    },
    point: function (t, z, i) {
      if (z === 'head') { t.f.zone = 'head'; t.f.h = i; inputNameHead(t, i); }
      else if (z === 'hdmi-key') { t.f.zone = 'keys'; t.f.row = Math.floor(i / 10); t.f.col = i % 10; this.key(t, 'ok'); }
      else if (z === 'hdmi-tool') { t.f.zone = 'tools'; t.f.col = i; inputNameTool(t, i); }
    }
  };

  /* ---------- Dispatch ---------- */
  function norm() { var t = top(), v = V[t.id]; if (v.norm) v.norm(t); }
  function panelBoundary(t, k) {
    if (t.id === 'home' || t.lifted) return false;
    if (t.id === 'appearance') return (k === 'up' && detailLocation(t).row === 0) || (k === 'left' && detailLocation(t).column === 0);
    if (t.id === 'wallpaper') return k === 'left' || k === 'up' && t.i === 0 && t.f.zone === 'photo';
    if (k !== 'up') return false;
    if (t.id === 'settings') return settingsIds().indexOf(t.f.id) === 0;
    if (t.id === 'apps' || t.id === 'editor' || t.id === 'hdmiName') return t.f.zone === 'head';
    return t.id === 'message';
  }
  function panelAction(action) {
    var t = top(), guard = 0;
    FrameDevice.cancelSource();
    if (action === 'home') {
      while (top().id !== 'home' && guard++ < 20) V[top().id].key(top(), 'back');
    } else {
      t.nav = null;
      V[t.id].key(t, 'back');
    }
    norm(); render(); syncRotation();
  }
  function press(k) {
    norm();
    var t = top();
    if (t.nav !== undefined && t.nav !== null && t.id !== 'home') {
      if (k === 'left') t.nav = 0;
      else if (k === 'right') t.nav = 1;
      else if (k === 'down') t.nav = null;
      else if (k === 'ok' || k === 'back') { panelAction(k === 'back' || t.nav === 0 ? 'back' : 'home'); return; }
    } else if (panelBoundary(t, k)) t.nav = 0;
    else V[t.id].key(t, k);
    norm(); render(); syncRotation();
  }

  /* ---------- Rendering ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var stage = $('stage'), homeEl = $('home'), caption = $('caption'), utilsEl = $('utils');
  var utilFocusLabel = $('utilFocusLabel'), utilFocusKey = '', appFocusName = $('appFocusName');
  var dock = $('dock'), shelf = $('shelf'), track = $('track'), plate = $('plate'), matScrim = $('matScrim'), dockEmpty = $('dockEmpty');
  var cueL = $('cueL'), cueR = $('cueR'), dockAction = $('dockAction');
  var focusStatus = $('focusStatus'), sceneEl = $('scene'), appearanceEl = $('appearance'), appearanceRows = $('appearanceRows'), appearanceDesc = $('appearanceDesc');
  var appearanceBack = $('appearanceBack'), appearanceTitle = $('appearanceTitle'), appearanceStatus = $('appearanceStatus');
  var phScene = $('phScene'), phPlate = $('phPlate'), phField = $('phField'), phList = $('phList'), phRows = $('phRows'), phAction = $('phAction'), phEmpty = $('phEmpty');
  var phPlates = [phPlate, $('phPlateAlt')], phFields = [phField, $('phFieldAlt')], photoPlateIndex = 0, photoPlateKey = null;
  var utPlates = [$('utLens'), $('utLensAlt')], utFields = [$('utField'), $('utFieldAlt')], utPlateIndex = 0, utPlateKey = null;
  var photoMode = null, photoTransitionToken = 0;
  var sheetEl = $('sheet'), sheetView = $('sheetView'), panelNav = $('panelNav');
  var IMG = { photo: $('photo'), mat: $('matImg'), bg: $('sheetBg'), field: $('phFieldImg'), fieldAlt: $('phFieldImgAlt'), utility: $('headerClockImg'), utilityAlt: $('headerMenuImg') };
  var sheetKey = '', slotEls = {}, dockEdgeFrame = 0, dockEdgeUntil = 0, dockAnchorCenter = 960;
  var appliedPalette = null, appliedPhoto = null, appliedFont = null, appliedFontMetrics = null;

  /* Curated locked palettes keep the existing rendering path exactly. */
  function applyAdaptiveInk(palette) {
    var active = S.c.bg === 'photo' && palette && !palette.locked && palette.light && palette.tl && palette.tr && palette.br;
    if (appliedPalette === palette && appliedPhoto === (S.c.bg === 'photo')) return !!active;
    appliedPalette = palette; appliedPhoto = S.c.bg === 'photo';
    ['tl', 'tr', 'br'].forEach(function (zone) {
      var r = active ? palette[zone] : null;
      var values = r ? { ink: r.ink, 'clock-ink': r.clockInk || r.ink, 'rest-ink': r.restInk, 'peer-ink': r.peerInk, rest: r.restAlpha, peer: r.peerAlpha, under: r.halo, shadow: r.shadow } : {};
      ['ink', 'clock-ink', 'rest-ink', 'peer-ink', 'rest', 'peer', 'under', 'shadow'].forEach(function (key) {
        var name = '--' + zone + '-' + key, value = values[key];
        if (value !== undefined && value !== null) stage.style.setProperty(name, String(value));
        else stage.style.removeProperty(name);
      });
    });
    if (active && palette.light) stage.style.setProperty('--home-app-ink', palette.light);
    else stage.style.removeProperty('--home-app-ink');
    return !!active;
  }
  function inkRungClasses(palette, active) {
    if (!active) return '';
    return ['tl', 'tr', 'br'].map(function (zone) {
      var rung = palette[zone].rung;
      return ['light', 'mist', 'mist-high', 'dark', 'dark-halo'].indexOf(rung) >= 0 ? ' ink-' + zone + '-' + rung : '';
    }).join('');
  }
  function render() {
    var t = top(), sheet = !!V[t.id].sheet, shown = wall(S.shown ? S.shown.wall : S.c.wall), palette = ADAPTIVE_INK[shown.id];
    var adaptive = applyAdaptiveInk(palette), tr = adaptive && palette.tr ? palette.tr.pol : shown.ut.tr, br = adaptive && palette.br ? palette.br.pol : shown.ut.br;
    stage.className = 'stage bg-' + S.c.bg + ' l-' + S.c.layout + ' v-' + S.variant + ' m-' + (materialApplies() ? S.c.material : 'none') + ' f-' + S.c.focus + ' a-' + S.c.apps + ' u-' + S.c.controls + ' g-' + S.geom + ' tone-' + shown.tone + ' tr-' + tr + ' br-' + br + wallClasses(shown) + inkRungClasses(palette, adaptive) + ' at-' + t.id + ' font-' + homeFont() + (homeFont() !== 'manrope' ? ' font-custom' : '') + (S.fontSwitch ? ' is-font-switch' : '') + (adaptive ? ' has-adaptive-ink adaptive-tl-' + palette.tl.pol : '') + (!adaptive && shown.clockInk ? ' has-clock-ink' : '') + (!adaptive && shown.dockClockInk ? ' has-dock-clock-ink' : '') + (registeredMaterial(shown.id) ? ' registered-material' : '') + (sheet ? ' is-sheet' : '') + (S.reflow ? ' is-reflow' : '');
    if (!adaptive && shown.clockInk) stage.style.setProperty('--clock-ink', shown.clockInk);
    else stage.style.removeProperty('--clock-ink');
    if (!adaptive && shown.dockClockInk) stage.style.setProperty('--dock-clock-ink', shown.dockClockInk);
    else stage.style.removeProperty('--dock-clock-ink');
    applyHomeFont();
    if (!sheet) renderHome(t);
    renderSheet(t, sheet);
    renderAppearance(t);
    renderPanelNav(t);
    renderFocusStatus(t);
  }

  function applyHomeFont() {
    var id = homeFont(), f = FONTS[id], primary = fontRole(id, 'primary'), ui = fontRole(id, 'ui'), metrics = fontMetrics[id];
    if (appliedFont === id && appliedFontMetrics === metrics) return;
    appliedFont = id; appliedFontMetrics = metrics;
    var values = { 'display-family': '"' + f.family + '"', 'ui-family': '"' + ui.family + '"', 'primary-family': '"' + primary.family + '"', 'display-weight': f.display, 'ui-weight': ui.weight, 'primary-weight': primary.weight, 'clock-weight': f.clock,
      'clock-shift': px(fontShift('clock', 48)), 'utility-shift': px(fontShift('ui', 28)), 'action-shift': px(fontShift('ui', 30)), 'heading-shift': px(fontShift('ui', 48)), 'full-name-shift': px(fontShift('primary', 30)), 'clock-digit': px(metrics ? metrics.digitCell : 0) };
    Object.keys(values).forEach(function (key) { homeEl.style.setProperty('--font-' + key, String(values[key])); });
  }

  function homeState(t) {
    var h = S.c.home, hs = { mode: 'browse', zone: null, i: Math.max(0, ensureSel()), u: -1, lifted: false, from: -1, arr: null, items: h.map(function (id) { return { key: id, kind: 'app', id: id }; }) };
    if (isSettingsDetail(t)) hs.zone = 'preview';
    else if (t.id === 'home') { hs.zone = t.f.zone; hs.u = t.f.u; }
    return hs;
  }

  function renderHome(t) {
    var hs = homeState(t);
    renderCaption(t, hs);
    renderUtils(hs);
    if (S.c.layout === 'list') renderList(hs);
    else { photoMode = null; renderDock(hs); }
    renderAppFocusName(hs);
  }

  function clockText() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }
  function clockHtml() {
    var text = clockText(), metrics = fontMetrics[homeFont()];
    if (!metrics || !metrics.digitCell) return text;
    return text.replace(/[0-9]/g, function (digit) { return '<span class="clock-digit">' + digit + '</span>'; });
  }
  function renderCaption(t, hs) {
    var html = '<span class="clock-line"><span class="clock">' + clockHtml() + '</span><span class="clock-day">' + ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][new Date().getDay()] + '</span></span>';
    if (S.c.apps !== 'icons' && hs.items[hs.i] && (S.c.layout === 'list' ? photoLabel(hs.items[hs.i].id, false).size < 88 || photoLabel(hs.items[hs.i].id, false).ellipsis : hs.zone === 'apps' && reducedDockLabel(hs.items[hs.i].id))) html += '<span class="cap-line full-name">' + esc(app(hs.items[hs.i].id).name) + '</span>';
    setHTML(caption, html);
  }

  function utilBtn(z, i, action, inner, extra, name) {
    return '<button type="button" tabindex="-1" class="u' + (extra || '') + '" data-z="' + z + '" data-i="' + i + '" data-action="' + action + '" aria-label="' + esc(name) + '"><span class="u-content">' + inner + '</span></button>';
  }
  function renderUtils(hs) {
    var html = '', style = hs.mode === 'arrange' && S.c.controls !== 'text' ? 'both' : S.c.controls;
    var iconsOnly = style === 'icons', U = utils(), focused = null;
    utilsEl.className = 'utils quiet-utils is-' + style + (hs.zone === 'util' || hs.zone === 'ctl' ? ' is-awake' : '');
    U.forEach(function (u, i) { html += utilBtn('util', i, 'util.' + u, icon(UTIL[u][1], '', true) + '<span class="u-label">' + UTIL[u][0] + '</span>', '', UTIL[u][0]); });
    setHTML(utilsEl, html);
    Array.prototype.forEach.call(utilsEl.querySelectorAll('.u'), function (b) {
      var z = b.getAttribute('data-z'), focus = hs.zone === z && hs.u === Number(b.getAttribute('data-i'));
      b.className = b.className.replace(/\s+is-focus/g, '') + (focus ? ' is-focus' : '');
      if (focus) focused = b;
    });
    alignDockHeader(hs);
    renderUtilFocusLabel(iconsOnly ? focused : null);
    renderUtilityLens(focused, iconsOnly);
  }
  /* Shared stage margins, including Settings' scaled Home preview. */
  function alignDockHeader(hs) {
    if (S.c.layout !== 'dock') {
      caption.style.left = ''; caption.style.top = '';
      utilsEl.style.top = ''; utilsEl.style.right = ''; utilsEl.style.transform = '';
      renderHeaderMaterials(); return;
    }
    var g = dockGeom(hs.items.length || -1), clock = caption.querySelector('.clock-line'), available, factor;
    caption.style.left = g.x + 'px'; caption.style.top = HOME_EDGE + 'px';
    utilsEl.style.top = HOME_EDGE + 'px'; utilsEl.style.right = '96px';
    // A very short carousel can put the clock near the centre. Keep both blocks
    // separate without shrinking the clock or clipping a long weekday.
    available = 1824 - g.x - (clock ? clock.offsetWidth : 300) - 32;
    factor = Math.min(1, Math.max(.1, available / Math.max(1, utilsEl.offsetWidth)));
    utilsEl.style.transform = factor < 1 ? 'scale(' + factor + ')' : '';
    renderHeaderMaterials();
  }
  function renderHeaderMaterials() {
    var sr = sceneEl.getBoundingClientRect(), scale = sr.width / 1920 || 1;
    [{ surface: 'headerClockSurface', target: caption.querySelector('.clock-line'), image: IMG.utility },
      { surface: 'headerMenuSurface', target: utilsEl, image: IMG.utilityAlt }].forEach(function (part) {
      var surface = $(part.surface), r, x, y;
      surface.hidden = S.c.bg !== 'photo' || !part.target;
      if (surface.hidden) return;
      r = part.target.getBoundingClientRect(); x = (r.left - sr.left) / scale; y = (r.top - sr.top) / scale;
      surface.style.left = x + 'px'; surface.style.top = y + 'px';
      surface.style.width = r.width / scale + 'px'; surface.style.height = r.height / scale + 'px';
      part.image.style.left = -x + 'px'; part.image.style.top = -y + 'px';
    });
  }
  function renderUtilFocusLabel(button) {
    var text, key, r, sr, scale, width, x;
    if (!button) { utilFocusLabel.className = 'util-focus-label'; utilFocusKey = ''; return; }
    text = S.err ? 'No se ha guardado. Pulsa OK para reintentar.' : button.getAttribute('aria-label');
    key = button.getAttribute('data-action') + '|' + text + '|' + homeFont();
    if (key !== utilFocusKey) {
      utilFocusLabel.className = 'util-focus-label'; utilFocusLabel.textContent = text;
      utilFocusLabel.offsetWidth;
      utilFocusKey = key;
    }
    r = button.getBoundingClientRect(); sr = sceneEl.getBoundingClientRect(); scale = sr.width / 1920 || 1;
    width = Math.ceil(textWidth(text, 28, 500, -.2) + 8); x = (r.left + r.width / 2 - sr.left) / scale - width / 2;
    if (S.c.layout === 'list') x = 1730 - width;
    utilFocusLabel.style.width = width + 'px'; utilFocusLabel.style.left = clamp(x, 112, 1808 - width) + 'px';
    utilFocusLabel.style.top = ((S.c.layout === 'list' ? (r.top + r.height / 2 - sr.top) / scale - 19 : (r.bottom - sr.top) / scale + 12) + fontShift('ui', 28)) + 'px';
    utilFocusLabel.className = 'util-focus-label is-on';
  }
  function renderUtilityLens(button, iconsOnly) {
    var r, label, sr, scale, x, y, width, key, el;
    if (!button || S.c.focus !== 'glass') {
      utPlates.forEach(function (plateEl) { plateEl.className = 'ph-plate ut-lens is-outgoing'; });
      utPlateKey = null;
      return;
    }
    r = button.getBoundingClientRect(); sr = sceneEl.getBoundingClientRect(); scale = sr.width / 1920 || 1;
    y = (r.top - sr.top) / scale + 2;
    if (S.c.layout === 'list') {
      label = iconsOnly ? utilFocusLabel : button.querySelector('.u-label');
      x = (label.getBoundingClientRect().left - sr.left) / scale - 24;
      width = 1800 - x;
    } else {
      // Dock icons keep a fixed lens; the separate caption cannot overlap its neighbours.
      x = (r.left - sr.left) / scale; width = r.width / scale;
    }
    key = button.getAttribute('data-action') + '|' + x + '|' + y + '|' + width;
    if (key !== utPlateKey) {
      utPlates[utPlateIndex].className = 'ph-plate ut-lens is-outgoing';
      utPlateIndex = 1 - utPlateIndex; el = utPlates[utPlateIndex];
      el.className = 'ph-plate ut-lens is-preparing';
      el.style.width = width + 'px'; el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      fieldTransform(utFields[utPlateIndex], x, y, width, 60);
      el.offsetWidth;
      utPlateKey = key;
    }
    fieldTransform(utFields[utPlateIndex], x, y, width, 60);
    utPlates[utPlateIndex].className = 'ph-plate ut-lens is-current on-focus';
  }
  function renderAppFocusName(hs) {
    var it = hs.items[hs.i], width, x, y, placement;
    if (S.c.apps !== 'icons' || hs.mode !== 'browse' || hs.zone !== 'apps' || !it) { appFocusName.className = 'app-focus-name'; return; }
    appFocusName.textContent = app(it.id).name;
    width = Math.min(S.c.layout === 'list' ? 1056 : 1640, Math.ceil(textWidth(app(it.id).name, S.c.layout === 'list' ? 40 : 36, 500, -.6, 'primary') + 8));
    appFocusName.style.width = width + 'px';
    if (S.c.layout === 'list') {
      x = 280; placement = phFields[photoPlateIndex]._placement;
      y = placement.y + placement.height / 2 - 24;
    } else {
      x = clamp(dockAnchorCenter - width / 2, 140, 1780 - width); y = 1080 - HOME_EDGE - 44 - fontShift('primary', 36);
    }
    appFocusName.style.left = x + 'px'; appFocusName.style.top = (y + fontShift('primary', S.c.layout === 'list' ? 40 : 36)) + 'px';
    appFocusName.className = 'app-focus-name is-on';
  }

  function dockGeom(n) {
    var m = DOCK_MODES[S.c.apps], vis = Math.max(1, Math.min(5, n)), shelfW = vis * m.pitch - 8, w = shelfW + 32;
    var broad = S.geom === 'broad' && n > 5;
    if (n < 0) { w = 912; shelfW = 880; }
    else if (broad) { w = 1728; shelfW = 1696; }
    return { x: Math.round((1920 - w) / 2), y: 1080 - HOME_EDGE - (S.c.apps === 'icons' && n > 0 ? 72 : 0) - m.th - 32, h: m.th + 32, w: w, shelf: shelfW, vis: vis, broad: broad, empty: n < 0, tw: m.tw, th: m.th, pitch: m.pitch };
  }
  /* Five centred: the window moves one tile when focus passes an edge. Broad: keep a
     148px glimpse of the neighbour, as the current dock does. */
  function dockOffset(n, i, g) {
    var off, left, first, glimpse = g.tw / 2;
    if (g.broad) {
      off = scroll.off * g.pitch; left = i * g.pitch;
      if (left - off < (i > 0 ? glimpse : 0)) off = left - (i > 0 ? glimpse : 0);
      if (left + g.tw - off > g.shelf - (i < n - 1 ? glimpse : 0)) off = left + g.tw - g.shelf + (i < n - 1 ? glimpse : 0);
      off = clamp(off, 0, Math.max(0, n * g.pitch - 8 - g.shelf));
      if (!S.reflow) { scroll.off = off / g.pitch; scroll.first = Math.round(scroll.off); }
      return off;
    }
    first = clamp(scroll.first, 0, Math.max(0, n - g.vis));
    if (i < first) first = i;
    if (i > first + g.vis - 1) first = i - g.vis + 1;
    if (!S.reflow) { scroll.first = first; scroll.off = first; }
    return first * g.pitch;
  }
  function dockTileHtml(it, full) {
    var a, body;
    if (it.kind === 'add') return '<span class="add">' + icon('plus') + '</span><span class="label">' + (full ? 'Inicio está lleno' : 'Añadir aplicación') + '</span>';
    a = app(it.id);
    body = S.c.apps === 'text' ? '' : appMark(a, S.c.apps === 'icons' ? 136 : 120, S.c.apps === 'icons' ? 88 : 72, S.c.apps === 'icons' ? 72 : 58);
    return body + (S.c.apps === 'icons' ? '' : '<span class="label" style="font-size:' + dockLabelSize(a.id) + 'px;top:' + ((S.c.apps === 'text' ? 28 : 128) + fontShift('primary', dockLabelSize(a.id))) + 'px"><span class="label-ink">' + esc(a.name) + '</span></span>') + '<span class="nudge nudge-l">' + icon('left') + '</span><span class="nudge nudge-r">' + icon('right') + '</span>';
  }
  /* A wide label can reach the shelf before its icon. Check the rendered icon box,
     including during the track's 180ms transition, so both disappear together. */
  function syncDockEdges() {
    var broad = S.c.layout === 'dock' && S.geom === 'broad', clip = shelf.getBoundingClientRect(), changes = [];
    Array.prototype.forEach.call(track.querySelectorAll('.tile'), function (tile) {
      var content = tile.querySelector(S.c.apps === 'text' ? '.label-ink' : '.mark'), r = content ? content.getBoundingClientRect() : null;
      var outside = broad && r && (r.right <= clip.left || r.left >= clip.right);
      var cls = tile.className.replace(/\s+is-outside-icon/g, '') + (outside ? ' is-outside-icon' : '');
      if (tile.className !== cls) changes.push({ tile: tile, cls: cls });
    });
    changes.forEach(function (change) { change.tile.className = change.cls; });
  }
  function trackDockEdges() {
    dockEdgeFrame = 0;
    if (S.c.layout !== 'dock' || S.geom !== 'broad') return;
    syncDockEdges();
    if (Date.now() < dockEdgeUntil) dockEdgeFrame = window.requestAnimationFrame(trackDockEdges);
  }

  function renderDock(hs) {
    var items = hs.items, n = items.length, empty = hs.mode !== 'arrange' && !n, g = dockGeom(empty ? -1 : n);
    var anchor = clamp(hs.i, 0, Math.max(0, n - 1)), off = empty ? 0 : dockOffset(n, anchor, g);
    var full = false, ns = n;
    var tileFocus = hs.zone === 'apps' || hs.zone === 'tiles', tileSel = hs.zone === 'act' || hs.zone === 'ctl' || hs.zone === 'preview';
    var focusItem = items[anchor], s, ax, label, width;

    dock.className = 'dock' + (empty ? ' is-empty' : '');
    dock.style.left = g.x + 'px'; dock.style.top = g.y + 'px'; dock.style.width = g.w + 'px'; dock.style.height = g.h + 'px';
    dock.style.setProperty('--tile-w', g.tw + 'px'); dock.style.setProperty('--tile-h', g.th + 'px'); dock.style.setProperty('--dock-h', g.h + 'px');
    dock.style.setProperty('--nudge-top', ((g.th - 48) / 2) + 'px');
    dockAnchorCenter = g.x + 16 + anchor * g.pitch - off + g.tw / 2;
    IMG.mat.style.left = (-g.x) + 'px'; IMG.mat.style.top = (-g.y) + 'px';
    IMG.mat.style.transformOrigin = '960px ' + (g.y + g.h / 2) + 'px';
    matScrim.style.left = (-g.x) + 'px'; matScrim.style.top = (SCRIM_Y - g.y) + 'px';
    matScrim.style.transformOrigin = '960px ' + (g.y + g.h / 2 - SCRIM_Y) + 'px';
    shelf.style.width = g.shelf + 'px';
    shelf.className = 'shelf' + (g.broad && off > 0 ? ' fade-l' : '') + (g.broad && off + g.shelf < n * g.pitch - 8 ? ' fade-r' : '');

    keyed(track, empty ? [] : items, function (el, it, i) {
      var a = it.id ? app(it.id) : null, left = i * g.pitch, focus = tileFocus && i === anchor, sel = tileSel && i === anchor;
      var lifted = hs.lifted && i === anchor, partial = g.broad && (left - off < -1 || left + g.tw - off > g.shelf + 1);
      setContent(el, it.kind + '|' + (it.id || '') + '|' + (it.id ? app(it.id).name : '') + '|' + (it.id ? inputIcons[String(app(it.id).sourceNumber)] || '' : '') + '|' + (it.id ? dockLabelSize(it.id) : full) + '|' + S.c.bg + '|' + S.c.apps + '|' + homeFont(), function () { return '<span class="tile-content">' + dockTileHtml(it, full) + '</span>'; });
      el.className = 'tile k-' + it.kind + (focus ? ' is-focus' : '') + (sel ? ' is-sel' : '') + (lifted ? ' is-lifted' : '') + (partial ? ' is-partial' : '')
        + (a && !a.mark ? ' is-text' : '') + (it.kind === 'add' && full ? ' is-full' : '') + (it.kind === 'app' && S.press === it.id ? ' is-press' : '')
        + (lifted && i === 0 ? ' no-l' : '') + (lifted && i >= ns - 1 ? ' no-r' : '');
      el.style.transform = 'translate3d(' + left + 'px,0,0)';
      el.setAttribute('role', 'button');
      if (a) el.setAttribute('aria-label', a.name);
      if (hs.mode === 'arrange') attrs(el, 'tile', i, 'arrange.' + (it.kind === 'add' ? 'add' : (it.kind === 'ph' ? 'placeholder.' : 'tile.') + it.id));
      else attrs(el, 'app', i, 'home.app.' + it.id);
    });
    track.style.transform = 'translate3d(' + (-off) + 'px,0,0)';
    syncDockEdges();
    if (g.broad) {
      dockEdgeUntil = Date.now() + 220;
      if (!dockEdgeFrame) dockEdgeFrame = window.requestAnimationFrame(trackDockEdges);
    }
    plate.className = 'plate' + (!n || empty || hs.zone === null ? '' : hs.lifted ? ' on-lift' : tileFocus ? ' on-focus' : tileSel ? ' on-sel' : '');
    plate.style.transform = 'translate3d(' + (anchor * g.pitch) + 'px,0,0)';

    cueL.style.left = (g.x - 72) + 'px'; cueR.style.left = (g.x + g.w + 24) + 'px';
    cueL.style.top = cueR.style.top = (g.y + g.h / 2 - 24) + 'px';
    cueL.className = 'cue' + (!g.broad && !empty && scroll.first > 0 ? ' is-on' : '');
    cueR.className = 'cue' + (!g.broad && !empty && scroll.first + g.vis < n ? ' is-on' : '');

    ax = g.x + 16 + anchor * g.pitch - off;
    if (hs.mode === 'arrange' && !hs.lifted && (hs.zone === 'tiles' || hs.zone === 'act') && focusItem && focusItem.kind !== 'add') {
      s = hs.arr.slots[anchor];
      label = (s.removed ? 'Restaurar ' : 'Quitar ') + app(s.id).name; width = actionWidth(label);
      ax = clamp(ax + (g.tw - width) / 2, 112, 1808 - width);
      setHTML(dockAction, '<span>' + esc(label) + '</span>');
      dockAction.className = 'dock-action is-on' + (hs.zone === 'act' ? ' is-focus' : '');
      dockAction.style.width = width + 'px';
      dockAction.style.transform = 'translate3d(' + ax + 'px,0,0)';
      attrs(dockAction, 'act', anchor, 'arrange.' + (s.removed ? 'restore.' : 'remove.') + s.id);
    } else {
      dockAction.className = 'dock-action';
      dockAction.removeAttribute('data-z'); dockAction.removeAttribute('data-action');
    }
    setHTML(dockEmpty, empty ? '<p>No hay aplicaciones en Inicio</p><button type="button" tabindex="-1" class="btn' + (hs.zone === 'empty' ? ' is-focus' : '') + '" data-z="empty" data-i="0" data-action="home.add-apps">' + icon('plus') + '<span>Añadir aplicaciones</span></button>' : '');
  }

  function photoModeTransition(compact) {
    if (photoMode !== null && photoMode !== compact) {
      var ghost = phScene.cloneNode(true), token = ++photoTransitionToken;
      ghost.removeAttribute('id'); ghost.setAttribute('aria-hidden', 'true');
      Array.prototype.forEach.call(ghost.querySelectorAll('[id],[data-action],[data-z]'), function (el) {
        el.removeAttribute('id'); el.removeAttribute('data-action'); el.removeAttribute('data-z');
      });
      ghost.className = 'ph-scene ph-ghost';
      phScene.parentNode.appendChild(ghost);
      phScene.className = 'ph-scene ph-incoming';
      setTimeout(function () {
        if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
        if (token === photoTransitionToken) phScene.className = 'ph-scene';
      }, 180);
    }
    photoMode = compact;
  }
  /* Each plate keeps a stationary, stage-registered field while its opacity changes.
     Reuse the hidden group for the next label; never animate plate width or position. */
  function renderPhotoPlate(id, width, height, y, state) {
    var key = id + '|' + width + '|' + height + '|' + y, plateEl, fieldEl;
    if (key !== photoPlateKey) {
      phPlates[photoPlateIndex].className = phPlates[photoPlateIndex].className.replace(' is-current', '') + ' is-outgoing';
      photoPlateIndex = 1 - photoPlateIndex;
      plateEl = phPlates[photoPlateIndex]; fieldEl = phFields[photoPlateIndex];
      plateEl.className = 'ph-plate is-preparing';
      plateEl.style.width = width + 'px'; plateEl.style.height = height + 'px';
      plateEl.style.transform = 'translate3d(0,' + y + 'px,0)';
      fieldTransform(fieldEl, 112, y, width, height);
      plateEl.offsetWidth; // Establish zero opacity before the incoming crossfade.
      photoPlateKey = key;
    }
    fieldTransform(phFields[photoPlateIndex], 112, y, width, height);
    phPlates[photoPlateIndex].className = 'ph-plate is-current' + (state ? ' ' + state : '');
  }
  function fieldTransform(el, x, y, width, height) {
    el._placement = { x: x, y: y, width: width, height: height };
    el.style.transformOrigin = (x + width / 2) + 'px ' + (y + height / 2) + 'px';
    el.style.transform = 'translate3d(' + (-x) + 'px,' + (-y) + 'px,0)' + (S.c.bg === 'photo' && S.c.material === 'tint' && !REDUCED_MOTION ? ' scale(1.04)' : '');
  }
  function renderList(hs) {
    var items = hs.items, n = items.length, compact = hs.mode === 'arrange', pitch = compact ? PH_COMPACT_PITCH : PH_PITCH;
    var anchor = clamp(hs.i, 0, Math.max(0, n - 1)), first, off, width, slot, y, s, label, aw, plateState;
    var rowFocus = hs.zone === 'apps' || hs.zone === 'tiles', remembered = hs.zone === 'act' || hs.zone === 'ctl' || hs.zone === 'preview';
    photoModeTransition(compact);
    if (compact) {
      first = clamp(scroll.photoArrange, anchor - 7, anchor - 1);
      first = clamp(first, 0, Math.max(0, n - PH_COMPACT_VISIBLE));
      scroll.photoArrange = first;
    } else {
      first = clamp(scroll.photo, anchor - 3, anchor - 1);
      first = clamp(first, 0, Math.max(0, n - PH_FULL));
      scroll.photo = first;
    }
    off = first * pitch; slot = anchor - first;
    width = items[anchor] ? listPlateWidth(items[anchor].id, compact) : 360;
    phList.className = 'ph-list' + (compact ? ' is-compact' : '');
    phList.style.height = PH_HEIGHT + 'px';
    phRows.style.top = (compact ? 72 : 148) + 'px';
    keyed(phRows, items, function (row, it, i) {
      var typography = photoLabel(it.id, compact), focus = rowFocus && i === anchor, lifted = hs.lifted && i === anchor, markImage, body = '';
      setContent(row, it.id + '|' + app(it.id).name + '|' + (inputIcons[String(app(it.id).sourceNumber)] || '') + '|' + typography.size + '|' + S.c.bg + '|' + S.c.apps + '|' + homeFont(), function () {
        if (S.c.apps !== 'text') body += appMark(app(it.id), S.c.apps === 'icons' ? compact ? 64 : 88 : compact ? 60 : 84, S.c.apps === 'icons' ? compact ? 64 : 88 : compact ? 44 : 64, S.c.apps === 'icons' ? compact ? 52 : 72 : compact ? 42 : 54);
        if (S.c.apps !== 'icons') body += '<span class="ph-name" style="font-size:' + typography.size + 'px;top:' + typography.top + 'px">' + esc(app(it.id).name) + '</span>';
        return '<span class="ph-group">' + body + '</span><span class="ph-move ph-move-up">' + icon('up') + '</span><span class="ph-move ph-move-down">' + icon('down') + '</span>';
      });
      markImage = row.querySelector('.mark img');
      if (markImage) {
        markImage.onerror = function () { this.style.visibility = 'hidden'; };
        if (markImage.complete && !markImage.naturalWidth) markImage.style.visibility = 'hidden';
      }
      row.className = 'ph-row k-' + it.kind + (focus ? ' is-focus' : '') + (remembered && i === anchor ? ' is-sel' : '') + (lifted ? ' is-lifted' : '')
        + (lifted && i === 0 ? ' no-up' : '') + (lifted && i === n - 1 ? ' no-down' : '')
        + (it.kind === 'app' && S.press === it.id ? ' is-press' : '');
      row.style.width = (compact ? listPlateWidth(it.id, compact) : 1200) + 'px'; row.style.height = pitch + 'px';
      row.style.transform = 'translate3d(0,' + (i * pitch) + 'px,0)';
      row.setAttribute('role', 'button'); row.setAttribute('aria-label', app(it.id).name);
      attrs(row, compact ? 'tile' : 'app', i, compact ? 'arrange.' + (it.kind === 'ph' ? 'placeholder.' : 'tile.') + it.id : 'home.app.' + it.id);
    });
    phRows.style.transform = 'translate3d(0,' + (-off) + 'px,0)';
    y = (compact ? PH_COMPACT_TOP + 2 : PH_TOP + 1) + slot * pitch;
    plateState = !n || hs.zone === null ? '' : hs.lifted ? 'on-lift' : S.c.focus === 'glass' && rowFocus ? 'on-focus' : S.c.focus === 'glass' && remembered ? 'on-sel' : '';
    renderPhotoPlate(items[anchor] ? items[anchor].id : '', width, compact ? 88 : 134, y, plateState);
    if (compact && !hs.lifted && (hs.zone === 'tiles' || hs.zone === 'act') && items[anchor]) {
      s = hs.arr.slots[anchor]; label = (s.removed ? 'Restaurar ' : 'Quitar ') + app(s.id).name; aw = actionWidth(label);
      setHTML(phAction, '<span>' + esc(label) + '</span>');
      phAction.className = 'ph-action is-on' + (hs.zone === 'act' ? ' is-focus' : '');
      phAction.style.width = aw + 'px';
      phAction.style.transform = 'translate3d(' + (112 + width + 24) + 'px,' + (PH_COMPACT_TOP + slot * pitch + 12) + 'px,0)';
      attrs(phAction, 'act', anchor, 'arrange.' + (s.removed ? 'restore.' : 'remove.') + s.id);
    } else { phAction.className = 'ph-action'; phAction.removeAttribute('data-z'); phAction.removeAttribute('data-action'); }
    phEmpty.className = 'ph-empty' + (!compact && !n ? ' is-on' : '');
    setHTML(phEmpty, !compact && !n ? '<p>No hay aplicaciones en Inicio</p><button type="button" tabindex="-1" class="btn' + (hs.zone === 'empty' ? ' is-focus' : '') + '" data-z="empty" data-i="0" data-action="home.add-apps">' + icon('plus') + '<span>Añadir aplicaciones</span></button>' : '');
  }

  /* Sheets: a frame is built once per view/mode; fill() updates its slots. Persistent
     scrollers let transforms animate. */
  function renderSheet(t, sheet) {
    var key;
    sheetEl.hidden = !(sheet || isSettingsDetail(t));
    sheetView.hidden = !sheet;
    if (sheet) { sheetView.setAttribute('aria-modal', 'true'); sheetView.setAttribute('aria-owns', 'panelNav'); }
    else { sheetView.removeAttribute('aria-modal'); sheetView.removeAttribute('aria-owns'); }
    sceneEl.setAttribute('aria-hidden', sheet || isSettingsDetail(t) ? 'true' : 'false');
    if (!sheet) { sheetView.innerHTML = ''; sheetKey = ''; return; }
    key = t.id + '|' + (t.mode || '') + '|' + (t.msg || '') + '|' + S.variant + '|' + S.c.bg;
    if (key !== sheetKey) {
      sheetView.innerHTML = FRAMES[t.id](t);
      sheetKey = key; slotEls = {};
      Array.prototype.forEach.call(sheetView.querySelectorAll('[data-slot]'), function (el) { slotEls[el.getAttribute('data-slot')] = el; });
    }
    FILLS[t.id](t, slotEls);
  }
  function renderAppearance(t) {
    appearanceEl.hidden = !isSettingsDetail(t);
    if (appearanceEl.hidden) { appearanceEl.removeAttribute('aria-modal'); appearanceEl.removeAttribute('aria-owns'); return; }
    appearanceEl.setAttribute('aria-modal', 'true'); appearanceEl.setAttribute('aria-owns', 'panelNav');
    if (t.id === 'wallpaper') { renderWallpaper(t); return; }
    V.appearance.norm(t);
    appearanceEl.className = 'appearance detail-' + t.group;
    appearanceRows.className = 'appearance-rows';
    appearanceTitle.textContent = DETAIL_NAMES[t.group];
    var at = detailLocation(t), selected = at.item, error = S.lookError, status = '', hint;
    function command(item, inner, cls) {
      var radio = !!item.axis || item.portIcon !== undefined;
      var applied = item.axis ? S.c[item.axis] === item.value : item.portIcon !== undefined && (inputIcons[String(t.input.number)] || 'hdmi') === item.portIcon;
      var loading = !!(item.axis && S.pending && S.pending.target[item.axis] === item.value && S.pending.row === item.axis);
      return '<button type="button" tabindex="-1" class="setting-choice' + (cls ? ' ' + cls : '') + (t.f.action === item.action && !panelFocused(t) ? ' is-focus' : '') + (item.disabled ? ' is-disabled' : '') + (applied ? ' is-applied' : '') + (loading ? ' is-loading' : '') + '"'
        + (radio ? ' role="radio" aria-checked="' + !!applied + '"' : '') + ' aria-label="' + esc(item.axis && item.value === 'both' ? 'Iconos y texto' : item.label) + '" aria-disabled="' + !!item.disabled + '" aria-busy="' + loading + '"'
        + ' data-z="detail" data-i="0" data-id="' + item.action + '" data-action="' + item.action + '">' + inner
        + (radio ? '<span class="setting-tick" aria-hidden="true">' + (applied ? icon('check') : '') + '</span>' : '') + '</button>';
    }
    appearanceBack.hidden = true;
    setHTML(appearanceRows, detailSections(t).map(function (section) {
      return '<section class="setting-section' + (section.horizontal ? ' is-horizontal' : '') + ' section-' + section.id + '">'
        + (section.title ? '<h3 class="setting-label" id="setting-' + section.id + '">' + section.title + '</h3>' : '')
        + '<div class="setting-options"' + (section.items[0].axis || section.items[0].portIcon !== undefined ? ' role="radiogroup" aria-label="' + esc(section.title || LOOK_NAMES[section.id] || DETAIL_NAMES[t.group]) + '"' : '') + '>'
        + section.items.map(function (item) {
          var swatch = item.axis === 'bg', body = '';
          if (swatch || item.thumbnail || item.thumbnailId) body += item.value === 'light' || item.value === 'dark'
            ? '<span class="setting-swatch swatch-' + item.value + '" aria-hidden="true"></span>'
            : '<img class="setting-swatch" src="' + WP + (item.thumbnailId || S.c.wall) + '-thumb.jpg" alt="">';
          if (item.inputNumber !== undefined) body += '<span class="input-choice-icon">' + (item.iconPreview && item.iconPreview !== 'hdmi' ? markHtml(item.iconPreview, 80, 48, 44) : item.iconPreview === 'hdmi' ? icon('inputs') : appMark({ sourceNumber: item.inputNumber, name: item.label }, 80, 48, 44)) + '</span>';
          body += '<span class="setting-copy"><span class="setting-name">' + esc(item.label) + '</span>'
            + (item.description ? '<span class="setting-description">' + esc(item.description) + '</span>' : '') + '</span>';
          if (!item.axis && item.portIcon === undefined) body += icon('right', 'setting-forward');
          return command(item, body, item.description ? 'has-description' : '');
        }).join('') + '</div>'
        + (section.reason ? '<p class="setting-reason">' + esc(section.reason) + '</p>' : '') + '</section>';
    }).join(''));
    var activeRow = appearanceRows.querySelector('.is-focus');
    if (activeRow && ['background', 'packs'].indexOf(t.group) >= 0) {
      if (activeRow.offsetTop < appearanceRows.scrollTop) appearanceRows.scrollTop = activeRow.offsetTop;
      else if (activeRow.offsetTop + activeRow.offsetHeight > appearanceRows.scrollTop + appearanceRows.clientHeight) appearanceRows.scrollTop = activeRow.offsetTop + activeRow.offsetHeight - appearanceRows.clientHeight;
    }
    if (S.pending) status = '<p>Cargando ' + esc(S.pending.row === 'font' ? FONTS[S.pending.target.font].name : 'tu selección') + '…</p><p>Volver cancela este cambio.</p>';
    else if (error) {
      status = '<p class="setting-error">' + (error.type === 'save' ? 'No se pudo guardar este cambio.' : error.type === 'font' ? 'No se pudo cargar ' + esc(FONTS[error.font].name) + '.' : 'No se pudo cargar este aspecto.') + ' Se conserva tu selección actual.</p>'
        + command({ action: 'settings.retry', label: 'Reintentar' }, '<span>Reintentar</span>', 'setting-retry');
    }
    setHTML(appearanceStatus, status);
    hint = selected.disabled ? '' : selected.action === 'settings.back' ? 'Volver a ' + (['rotation', 'packs', 'aspect', 'schedule'].indexOf(t.group) >= 0 ? 'Fondo' : t.group === 'inputs' ? 'Samsung' : 'Ajustes') : selected.action === 'settings.retry' ? 'Reintentar este cambio' : selected.axis || selected.portIcon !== undefined ? 'Aplicar la opción seleccionada' : selected.action === 'background.wallpaper' ? 'Elegir una escena del paquete' : selected.action.indexOf('background.') === 0 ? 'Abrir opciones del fondo' : selected.action.indexOf('schedule.') === 0 ? 'Cambiar la hora 30 minutos' : selected.action === 'background.rotation' ? 'Elegir el intervalo de rotación' : 'Abrir en la TV';
    setHTML(appearanceDesc, hint ? '<span class="remote-key">OK</span><span>' + esc(hint) + '</span>' : '');
  }
  function renderWallpaper(t) {
    V.wallpaper.norm(t);
    appearanceEl.className = 'appearance detail-wallpaper';
    appearanceTitle.textContent = 'Escenas del paquete';
    appearanceRows.className = 'appearance-rows wallpaper-picker';
    appearanceBack.hidden = true;
    setHTML(appearanceRows, '<div class="wallpaper-edge wallpaper-before" aria-hidden="true">' + icon('up') + '</div><div class="wallpaper-list" role="radiogroup" aria-label="Imagen"><div class="wallpaper-rows"></div></div><div class="wallpaper-edge wallpaper-after" aria-hidden="true">' + icon('down') + '</div>');
    var rows = appearanceRows.querySelector('.wallpaper-rows'), shown = wall(S.wallShown) || wall(S.c.wall), candidate = wallpaperChoices(t)[t.i], status, note, hint;
    keyed(rows, wallpaperChoices(t).map(function (w) { return { key: w.id, wall: w }; }), function (row, item, i) {
      var visible = i >= t.top && i < t.top + WALL_VISIBLE, w = item.wall, image;
      setContent(row, w.id + '|' + visible, function () { return '<span class="wallpaper-thumb">' + (visible ? '<img src="' + WP + w.id + '-thumb.jpg" alt="">' : '') + '</span><span class="setting-copy"><span class="setting-name">' + esc(WALL_ENGINE.locate(w.id).scene.name) + '</span></span><span class="setting-tick" aria-hidden="true"></span>'; });
      row.className = 'setting-choice wallpaper-choice' + (t.f.zone === 'photo' && t.i === i && !panelFocused(t) ? ' is-focus' : '') + (w.id === S.c.wall ? ' is-applied' : '');
      row.style.transform = 'translate3d(0,' + (i * WALL_ROW) + 'px,0)'; row.style.visibility = visible ? 'visible' : 'hidden';
      row.setAttribute('role', 'radio'); row.setAttribute('tabindex', '-1'); row.setAttribute('aria-label', w.name);
      row.setAttribute('aria-checked', String(w.id === S.c.wall)); row.setAttribute('aria-posinset', String(i + 1)); row.setAttribute('aria-setsize', String(wallpaperChoices(t).length));
      row.setAttribute('aria-busy', String(t.previewDue === w.id || S.wallPending === w.id));
      attrs(row, 'wall-choice', i, 'wallpaper.choose.' + w.id);
      setHTML(row.querySelector('.setting-tick'), w.id === S.c.wall ? icon('check') : '');
      image = row.querySelector('img');
      if (image && !image._wallBound) {
        image._wallBound = true;
        image.onerror = function () { this.parentNode.className = 'wallpaper-thumb is-missing'; };
        if (image.complete && !image.naturalWidth) image.onerror();
      }
    });
    rows.style.transform = 'translate3d(0,' + (-t.top * WALL_ROW) + 'px,0)';
    appearanceRows.querySelector('.wallpaper-before').className = 'wallpaper-edge wallpaper-before' + (t.top > 0 ? ' is-on' : '');
    appearanceRows.querySelector('.wallpaper-after').className = 'wallpaper-edge wallpaper-after' + (t.top + WALL_VISIBLE < wallpaperChoices(t).length ? ' is-on' : '');
    note = t.previewDue ? 'Preparando ' + candidate.name + '…' : S.wallPending ? (t.applyPending ? 'Aplicando ' : 'Cargando ') + candidate.name + '…' : shown.id === S.c.wall ? 'Aplicada' : 'Vista previa';
    if (t.failedId) note = S.err ? 'No se pudo guardar ' + wall(t.failedId).name + '.' : 'No se pudo cargar ' + wall(t.failedId).name + '.';
    status = '<p class="wallpaper-preview-name"><span>' + esc(shown.name) + '</span><span class="wallpaper-count">' + (Math.max(0, wallpaperChoices(t).map(function (w) { return w.id; }).indexOf(shown.id)) + 1) + ' de ' + wallpaperChoices(t).length + '</span></p><p class="wallpaper-preview-state' + (t.failedId ? ' setting-error' : '') + '">' + esc(note) + '</p>';
    if (t.failedId) status += '<button type="button" tabindex="-1" class="setting-choice setting-retry' + (t.f.zone === 'retry' && !panelFocused(t) ? ' is-focus' : '') + '" data-z="wall-retry" data-action="wallpaper.retry">Reintentar</button>';
    setHTML(appearanceStatus, status);
    hint = t.f.zone === 'back' ? 'Volver a Fondo' : t.f.zone === 'retry' ? 'Reintentar esta imagen' : 'Aplicar la imagen seleccionada';
    if (t.f.zone === 'photo' && candidate.id === S.c.wall && !S.pending && !t.failedId) hint = '';
    setHTML(appearanceDesc, hint ? '<span class="remote-key">OK</span><span>' + hint + '</span>' : '');
  }
  /* Keep the retry or membership state on the focused control. The stage-level line
     shares its position without changing the control's identity or key behaviour. */
  function renderFocusStatus(t) {
    if (t.nav !== undefined && t.nav !== null) { focusStatus.className = 'focus-status'; return; }
    if (isSettingsDetail(t)) { focusStatus.className = 'focus-status'; return; }
    var root = isSettingsDetail(top()) ? appearanceEl : sheetEl.hidden ? homeEl : sheetEl, active = root.querySelectorAll('.is-focus[data-action]'), target = null, text = S.err ? 'No se ha guardado. Pulsa OK para reintentar.' : '', i, r, sr, scale, x, y, w, action, solid, photoRow = false, photoFree = false;
    Array.prototype.forEach.call(stage.querySelectorAll('.has-local-status'), function (el) { el.className = el.className.replace(/\s+has-local-status/g, ''); });
    for (i = 0; i < active.length; i++) if (renderedAction(active[i])) { target = active[i]; break; }
    if (!text && t.id === 'arrange' && (t.f.zone === 'act' || t.f.zone === 'tiles')) {
      var slot = t.slots[t.f.i];
      if (slot && !slot.removed && t.f.zone === 'act' && S.c.home.length === 1) text = LAST;
    }
    if (!text && S.note === LAST && t.id === 'arrange') text = LAST;
    if (!target || !text) { focusStatus.className = 'focus-status'; return; }
    if (target.parentNode === utilsEl && utilsEl.className.indexOf('is-icons') >= 0) { renderUtilFocusLabel(target); focusStatus.className = 'focus-status'; return; }
    // Photo action pills stay on one line; the header already carries this status.
    if (S.c.layout === 'list' && t.id === 'arrange' && !t.lifted && (t.f.zone === 'act' || t.f.zone === 'tiles')) { focusStatus.className = 'focus-status'; return; }
    photoRow = S.c.layout === 'list' && target.className.indexOf('ph-row') >= 0;
    if (photoRow && phAction.className.indexOf('is-on') >= 0) target = phAction;
    else if (photoRow) photoFree = true;
    target.className += ' has-local-status';
    action = target.getAttribute('data-action');
    r = target.getBoundingClientRect(); sr = stage.getBoundingClientRect(); scale = sr.width / 1920 || 1;
    x = (r.left - sr.left) / scale; y = (r.top - sr.top) / scale; w = r.width / scale;
    if (photoFree) { x = 112 + parseFloat(phPlates[photoPlateIndex].style.width) + 24; y += (r.height / scale - 28) / 2; w = 400; }
    else if (action.indexOf('home.app.') === 0 || action.indexOf('arrange.tile.') === 0 || action.indexOf('arrange.placeholder.') === 0) y += 171;
    else if (action.indexOf('apps.order.') === 0) y += 86;
    else if (action.indexOf('apps.toggle.') === 0 || action.indexOf('apps.add.') === 0) y += 164;
    else if (action.indexOf('layout.') === 0) y += 54;
    else y += action.indexOf('arrange.remove.') === 0 || action.indexOf('arrange.restore.') === 0 ? 43 : 40;
    solid = /(?:^|\s)(?:u|btn|er-rm|dock-action|set-row|ph-action)(?:\s|$)/.test(target.className) && target.parentNode !== utilsEl && target.parentNode.className.indexOf('s-head') < 0;
    if (target === phAction && target.className.indexOf('is-focus') < 0) solid = false;
    focusStatus.className = 'focus-status is-on' + (solid ? ' dark-ink' : '') + (photoFree ? ' photo-status' : '');
    focusStatus.textContent = text;
    focusStatus.style.left = clamp(x + 8, 112, 1808 - Math.min(w - 16, 800)) + 'px';
    focusStatus.style.top = clamp(y, 72, 988) + 'px';
    focusStatus.style.width = Math.min(w - 16, 800) + 'px';
  }
  function panelFocused(t) { return t.nav !== undefined && t.nav !== null; }
  function renderPanelNav(t) {
    panelNav.hidden = t.id === 'home';
    if (panelNav.hidden) return;
    var active = t.nav !== undefined && t.nav !== null, parent = S.stack[S.stack.length - 2];
    var names = { home: 'Inicio', settings: 'Personalizar', apps: 'Apps y entradas', editor: 'Carrusel', appearance: 'Personalizar' };
    var back = t.id === 'wallpaper' || t.id === 'appearance' && ['rotation', 'packs', 'aspect', 'schedule'].indexOf(t.group) >= 0 ? 'Fondo' : parent && parent.id === 'appearance' ? DETAIL_NAMES[parent.group] : names[parent && parent.id] || 'menú anterior';
    setHTML(panelNav, [['back', t.lifted ? 'Cancelar movimiento' : 'Volver a ' + back, 'left'], ['home', 'Inicio', 'home']].map(function (item, i) {
      return '<button type="button" tabindex="-1" class="panel-nav-button' + (active && t.nav === i ? ' is-focus' : '') + '" data-z="panel-nav" data-i="' + i + '" data-action="panel.' + item[0] + '">' + icon(item[2]) + '<span>' + esc(item[1]) + '</span></button>';
    }).join(''));
    if (active && isSettingsDetail(t)) setHTML(appearanceDesc, '<span class="remote-key">OK</span><span>' + (t.nav === 1 ? 'Volver directamente a Inicio' : 'Volver al menú anterior') + '</span>');
  }
  function headButtons(list, fi, prefix) {
    return list.map(function (b, i) {
      return '<button type="button" tabindex="-1" class="btn' + (i === fi ? ' is-focus' : '') + (b[2] ? ' ' + b[2] : '') + '" data-z="head" data-i="' + i + '" data-action="' + prefix + '.' + b[0] + '" aria-label="' + esc(b[0] === 'undo' ? undoCaption() : b[1]) + '">' + (b[3] ? icon(b[3]) : '') + '<span>' + b[1] + '</span></button>';
    }).join('');
  }
  var FRAMES = {
    hdmiName: function () { return '<h2 class="s-title" data-slot="title"></h2><p class="s-sub" data-slot="sub"></p><div class="s-head" data-slot="head"></div><div class="hdmi-name-value" data-slot="value" role="textbox" aria-readonly="true" aria-label="Nombre de la entrada"></div><div class="hdmi-keyboard" data-slot="keyboard"></div><div class="hdmi-key-tools" data-slot="tools"></div><p class="hdmi-name-hint">Flechas para elegir · OK para escribir · Guardar aplica el nombre</p>'; },
    apps: function () {
      return '<h2 class="s-title" data-slot="title"></h2><p class="s-sub" data-slot="sub"></p><div class="s-head" data-slot="head"></div>'
        + '<div class="grid-view" data-slot="view"><div class="grid-in" data-slot="grid"></div></div>'
        + '<div class="row-cue grid-before" data-slot="before" aria-hidden="true">' + icon('up') + '</div><div class="row-cue grid-after" data-slot="after" aria-hidden="true">' + icon('down') + '</div>';
    },
    editor: function () {
      return '<h2 class="s-title">Añadir y ordenar</h2><p class="s-sub" data-slot="sub"></p><div class="s-head" data-slot="head"></div>'
        + '<p class="s-label z-home" data-slot="lh"></p><p class="s-label z-other">Disponibles para añadir</p>'
        + '<div class="ed-home" data-slot="home"></div><div class="ed-order-break" data-slot="break">Después, desplázate</div><div class="ed-other-view" data-slot="ov"><div class="ed-other" data-slot="other"></div></div><div class="ed-origin" data-slot="origin"></div>'
        + '<div class="row-cue editor-home-before" data-slot="homeBefore" aria-hidden="true">' + icon('up') + '</div><div class="row-cue editor-home-after" data-slot="homeAfter" aria-hidden="true">' + icon('down') + '</div>'
        + '<div class="row-cue editor-before" data-slot="otherBefore" aria-hidden="true">' + icon('up') + '</div><div class="row-cue editor-after" data-slot="otherAfter" aria-hidden="true">' + icon('down') + '</div>';
    },
    settings: function () { return '<h2 class="s-title">Personalizar menú</h2><div class="settings-overview" data-slot="list"></div><p class="settings-overview-hint" data-slot="hint"><span class="remote-key">OK</span><span>Abrir el grupo seleccionado</span></p>'; },
    message: function (t) {
      var m = messageContent(t);
      return '<h2 class="msg-title">' + esc(m.title) + '</h2><p class="msg-line">' + esc(m.line) + '</p><p class="msg-note">' + esc(m.note) + '</p><div class="msg-acts" data-slot="acts"></div>';
    }
  };
  function gridTileHtml(id) {
    var a = app(id), state = onHome(id) ? badge(true) + '<span>En Inicio</span>' : '';
    return '<span class="panel-content">' + appMark(a, 120, 72, 58) + '<span class="label">' + esc(a.name) + '</span></span><span class="state">' + state + '</span>';
  }
  var FILLS = {
    hdmiName: function (t, el) {
      var f = t.f, active = !panelFocused(t);
      setHTML(el.title, 'Nombre de HDMI ' + t.port);
      setHTML(el.sub, t.error ? '<span class="warn">' + esc(t.error) + '</span>' : 'Escribe con el mando y pulsa Guardar. Nombre original deja el campo vacío.');
      setHTML(el.head, headButtons([['save', 'Guardar', '', 'check'], ['cancel', 'Cancelar', '', 'left'], ['reset', 'Nombre original', '', 'undo']], active && f.zone === 'head' ? f.h : -1, 'hdmiName'));
      setHTML(el.value, '<span>' + esc(t.value || 'Nombre original al guardar') + '</span><small>' + t.value.length + '/40</small>');
      setHTML(el.keyboard, inputNameRows(t).map(function (row, r) {
        return '<div class="hdmi-key-row">' + row.split('').map(function (key, c) {
          return '<button type="button" tabindex="-1" class="hdmi-key' + (active && f.zone === 'keys' && f.row === r && f.col === c ? ' is-focus' : '') + '" data-z="hdmi-key" data-i="' + (r * 10 + c) + '" data-action="hdmiName.key.' + (r * 10 + c) + '">' + esc(t.upper ? key.toUpperCase() : key) + '</button>';
        }).join('') + '</div>';
      }).join(''));
      setHTML(el.tools, ['Espacio', 'Borrar letra', t.upper ? 'Minúsculas' : 'Mayúsculas', 'Vaciar', t.symbols ? 'Letras' : 'Acentos'].map(function (label, i) {
        return '<button type="button" tabindex="-1" class="btn' + (active && f.zone === 'tools' && f.col === i ? ' is-focus' : '') + '" data-z="hdmi-tool" data-i="' + i + '" data-action="hdmiName.tool.' + i + '">' + label + '</button>';
      }).join(''));
    },
    apps: function (t, el) {
      var f = t.f, items = appsItems(), n = items.length, rows = Math.ceil(n / COLS), vis = 3, row = Math.floor(f.i / COLS);
      setHTML(el.title, 'Apps y entradas');
      setHTML(el.sub, esc(catalog.loading ? 'Cargando aplicaciones instaladas…' : catalog.error || (!n ? 'No se encontraron aplicaciones ni entradas.' : 'OK abre el acceso. Para elegir los de Inicio, pulsa Añadir y ordenar.')));
      setHTML(el.head, headButtons(appsHead(), f.zone === 'head' && !panelFocused(t) ? f.h : -1, 'apps'));
      el.head.className = 's-head' + (f.zone === 'head' ? ' is-awake' : '');
      if (f.zone === 'grid') { if (row < t.top) t.top = row; if (row > t.top + vis - 1) t.top = row - vis + 1; }
      t.top = clamp(t.top, 0, Math.max(0, rows - vis));
      keyed(el.grid, items.map(function (id) { return { key: id, id: id }; }), function (tile, it, i) {
        var focus = f.zone === 'grid' && i === f.i && !panelFocused(t);
        setContent(tile, [it.id, app(it.id).name, inputIcons[String(app(it.id).sourceNumber)] || '', onHome(it.id)].join('|'), function () { return gridTileHtml(it.id); });
        tile.className = 'gt' + (focus ? ' is-focus' : '');
        tile.style.transform = 'translate3d(' + ((i % COLS) * GRID_COL) + 'px,' + (Math.floor(i / COLS) * GRID_ROW) + 'px,0)';
        tile.setAttribute('role', 'button'); tile.setAttribute('aria-label', app(it.id).name);
        attrs(tile, 'grid', i, 'apps.open.' + it.id);
      });
      el.grid.style.transform = 'translate3d(0,' + (-t.top * GRID_ROW) + 'px,0)';
      el.view.className = 'grid-view' + (t.top > 0 ? ' more-before' : '') + (rows - t.top > vis ? ' more-after' : '');
      el.before.className = 'row-cue grid-before' + (t.top > 0 ? ' is-on' : '');
      el.after.className = 'row-cue grid-after' + (rows - t.top > vis ? ' is-on' : '');
    },
    editor: function (t, el) {
      var f = t.f, H = t.lifted ? t.lifted.order : S.c.home, O = otherGroups(), list = O.recent.concat(O.rest);
      var entries = [], ys = [], y = 0, yf, minTop, maxTop = 0, rowEnd, before = false, afterRows = false;
      var hint = catalog.error ? catalog.error : catalog.loading ? 'Cargando aplicaciones y entradas…' : f.zone === 'head' && f.h === 0 ? undoCaption() : f.zone === 'home' && f.part === 'remove' ? (H.length <= 1 ? LAST : sourceShortcut(app(H[f.i])) ? 'OK quita el acceso del carrusel. La entrada sigue disponible.' : H[f.i] === LIVE_ID ? 'OK quita el acceso del carrusel. TV en directo sigue disponible.' : 'OK quita el acceso del carrusel. La aplicación sigue instalada.') : f.zone === 'other' ? 'OK añade este acceso al carrusel. ← vuelve a los accesos de Inicio.' : 'Para ordenar: pulsa OK, usa ↑↓ y pulsa OK. Para quitar: flecha derecha.';
      setHTML(el.sub, editStatus(hint, t.lifted ? 'Moviendo ' + app(t.lifted.id).name + '. ↑↓ cambia la posición; OK guarda; Volver cancela.' : ''));
      setHTML(el.head, headButtons(t.lifted ? [['cancel', 'Cancelar movimiento', '', 'left'], ['place', 'Guardar posición', '', 'check']] : [['undo', 'Deshacer', S.undo.length ? '' : 'is-idle', 'undo'], ['done', 'Terminar', '', 'check']], f.zone === 'head' && !panelFocused(t) ? f.h : -1, 'editor'));
      el.head.className = 's-head' + (f.zone === 'head' ? ' is-awake' : '');
      setHTML(el.lh, 'Orden del carrusel <span class="s-count">' + S.c.home.length + ' accesos</span>');
      t.homeTop = t.homeTop || 0;
      if (f.zone === 'home') {
        yf = editorHomeY(f.i);
        if (yf < t.homeTop) t.homeTop = yf;
        if (yf + 72 > t.homeTop + ED_VIEW) t.homeTop = yf + 72 - ED_VIEW;
      }
      t.homeTop = clamp(t.homeTop, 0, Math.max(0, editorHomeY(H.length - 1) + 72 - ED_VIEW));
      el['break'].className = 'ed-order-break' + (H.length > editorCut() && editorCut() * ED_ROW >= t.homeTop && editorCut() * ED_ROW + 24 <= t.homeTop + ED_VIEW ? ' is-on' : '');
      el['break'].style.top = (264 + editorCut() * ED_ROW - t.homeTop) + 'px';
      el.homeBefore.className = 'row-cue editor-home-before' + (t.homeTop > 0 ? ' is-on' : '');
      el.homeAfter.className = 'row-cue editor-home-after' + (editorHomeY(H.length - 1) + 72 > t.homeTop + ED_VIEW ? ' is-on' : '');

      keyed(el.home, H.map(function (id) { return { key: id, id: id }; }), function (row, it, i) {
        var a = app(it.id), here = f.zone === 'home' && i === f.i && !panelFocused(t), lifted = !!t.lifted && i === f.i;
        setContent(row, it.id + '|' + a.name + '|' + (inputIcons[String(a.sourceNumber)] || ''), function () { return '<div class="er-name" role="button"><span class="panel-content"><span class="er-num"></span>' + smallMark(a) + '<span class="er-text">' + esc(a.name) + '</span><span class="er-move">' + icon('updown') + '</span></span></div><div class="er-rm" role="button"><span></span></div>'; });
        row.className = 'er' + (here ? ' is-active' : '') + (lifted ? ' is-lifted' : '');
        row.style.transform = 'translate3d(' + (lifted ? 16 : 0) + 'px,' + (editorHomeY(i) - t.homeTop) + 'px,0)';
        row.style.visibility = editorHomeY(i) >= t.homeTop && editorHomeY(i) + 72 <= t.homeTop + ED_VIEW ? 'visible' : 'hidden';
        row.querySelector('.er-num').textContent = String(i + 1);
        setHTML(row.querySelector('.er-move'), icon('updown') + '<span>' + (lifted ? 'Moviendo' : 'Mover') + '</span>');
        row.firstChild.setAttribute('aria-label', (lifted ? 'Confirmar posición de ' : 'Mover ') + a.name);
        row.lastChild.setAttribute('aria-label', 'Quitar ' + a.name + ' de Inicio');
        row.firstChild.className = 'er-name' + (here && (f.part === 'name' || lifted) ? ' is-focus' : '');
        row.lastChild.className = 'er-rm' + (here && f.part === 'remove' && !lifted ? ' is-focus' : '') + (H.length <= 1 ? ' is-limit' : '');
        row.lastChild.firstChild.textContent = H.length <= 1 ? LAST : 'Quitar de Inicio';
        attrs(row.firstChild, 'name', i, 'editor.move.' + it.id);
        attrs(row.lastChild, 'remove', i, 'editor.remove.' + it.id);
      });
      el.origin.className = 'ed-origin' + (t.lifted && t.lifted.from !== f.i && editorHomeY(t.lifted.from) >= t.homeTop && editorHomeY(t.lifted.from) + 72 <= t.homeTop + ED_VIEW ? ' is-on' : '');
      if (t.lifted) el.origin.style.transform = 'translate3d(0,' + (264 + editorHomeY(t.lifted.from) - t.homeTop + 16) + 'px,0)';

      if (O.recent.length) { entries.push({ key: 'sep-recent', sep: 'Eliminadas recientemente', y: y }); y += ED_SEP; }
      O.recent.forEach(function (id) { entries.push({ key: id, id: id, y: y }); ys.push(y); y += ED_ROW; });
      if (O.recent.length && O.rest.length) { entries.push({ key: 'sep-rest', sep: 'Otros accesos disponibles', y: y }); y += ED_SEP; }
      O.rest.forEach(function (id) { entries.push({ key: id, id: id, y: y }); ys.push(y); y += ED_ROW; });
      if (f.zone === 'other' && ys.length) {
        yf = ys[f.j] - (O.recent.length && (f.j === 0 || f.j === O.recent.length) ? ED_SEP : 0);
        if (yf < t.top) t.top = yf;
        if (ys[f.j] + 72 > t.top + ED_VIEW) {
          minTop = ys[f.j] + 72 - ED_VIEW;
          entries.some(function (it) { if (it.y < minTop) return false; t.top = it.y; return true; });
        }
      }
      entries.some(function (it) { if (it.y < Math.max(0, y - ED_VIEW)) return false; maxTop = it.y; return true; });
      t.top = clamp(t.top, 0, maxTop);
      keyed(el.other, entries, function (row, it) {
        var j, focus, a;
        row.style.transform = 'translate3d(0,' + it.y + 'px,0)';
        rowEnd = it.y + (it.sep ? ED_SEP : 72);
        row.style.visibility = it.y >= t.top && rowEnd <= t.top + ED_VIEW ? 'visible' : 'hidden';
        before = before || it.y < t.top; afterRows = afterRows || rowEnd > t.top + ED_VIEW;
        if (it.sep) { setContent(row, 'sep|' + it.sep, function () { return esc(it.sep); }); row.className = 'eo-sep'; return; }
        j = list.indexOf(it.id); focus = f.zone === 'other' && j === f.j && !panelFocused(t); a = app(it.id);
        setContent(row, it.id + '|' + a.name + '|' + (inputIcons[String(a.sourceNumber)] || ''), function () { return '<span class="panel-content">' + smallMark(a) + '<span class="eo-text">' + esc(a.name) + '</span><span class="eo-verb"></span></span>'; });
        setHTML(row.querySelector('.eo-verb'), focus ? '<span class="verb">Añadir a Inicio</span>' : '');
        row.className = 'eo' + (focus ? ' is-focus' : '');
        row.setAttribute('role', 'button');
        attrs(row, 'other', j, 'editor.add.' + it.id);
      });
      el.other.style.transform = 'translate3d(0,' + (-t.top) + 'px,0)';
      el.ov.className = 'ed-other-view';
      el.otherBefore.className = 'row-cue editor-before' + (before ? ' is-on' : '');
      el.otherAfter.className = 'row-cue editor-after' + (afterRows ? ' is-on' : '');
    },
    settings: function (t, el) {
      var html = '';
      settingsRows().forEach(function (r) {
        html += '<button type="button" tabindex="-1" class="settings-group' + (r.id === t.f.id && !panelFocused(t) ? ' is-focus' : '') + '" data-z="row" data-i="0" data-id="' + r.id + '" data-action="settings.' + (r.id === 'editor' ? 'editor' : 'group.' + r.id) + '"><span class="settings-group-copy"><span class="settings-group-name">' + esc(r.label) + '</span><span class="settings-group-value">' + esc(r.value) + '</span></span>' + icon('right') + '</button>';
      });
      setHTML(el.list, html);
      setHTML(el.hint, '<span class="remote-key">OK</span><span>' + (panelFocused(t) ? t.nav === 1 ? 'Volver directamente a Inicio' : 'Volver al menú anterior' : 'Abrir el grupo seleccionado') + '</span>');
    },
    message: function (t, el) {
      setHTML(el.acts, messageContent(t).actions.map(function (a, i) {
        return '<button type="button" tabindex="-1" class="btn' + (i === t.f.b && !panelFocused(t) ? ' is-focus' : '') + '" data-z="act" data-i="' + i + '" data-action="message.' + a[0] + '"><span>' + a[1] + '</span></button>';
      }).join(''));
    }
  };

  /* ---------- Atomic appearance bundles ---------- */
  var wallToken = 0, committedBundle = null, reflowToken = 0, fontSwitchToken = 0;
  function registeredMaterial(id) { return S.c.bg === 'photo' && S.c.material === 'soft' && !!wall(id); }
  function matSrc(id, material) { return 'assets/materials/' + id + (material === 'soft' ? '-study-soft.jpg' : material === 'tint' ? '-field-clear.jpg' : '-field-frost.jpg'); }
  function fieldSrc(id, material) { return 'assets/materials/' + id + (material === 'soft' ? '-field-blur.jpg' : material === 'tint' ? '-field-clear.jpg' : '-field-frost.jpg'); }
  function makeImg(cls, src) { var im = document.createElement('img'); im.className = cls; im.alt = ''; im._src = src; im.src = src; return im; }
  function whenReady(im, done) {
    var fin = false, timer = setTimeout(function () { finish(!!(im.complete && im.naturalWidth)); }, document.hidden ? 20000 : 8000);
    function finish(ok) { if (fin) return; fin = true; clearTimeout(timer); done(ok); }
    function ready() {
      // Hidden TV prelaunch may suspend decode even after a valid image loads.
      if (document.hidden || !im.decode) { finish(true); return; }
      im.decode().then(function () { finish(true); }, function () { finish(!!(im.complete && im.naturalWidth)); });
    }
    if (im.complete) { if (im.naturalWidth) ready(); else finish(false); }
    else { im.onload = ready; im.onerror = function () { finish(false); }; }
  }
  function swapImg(k, im) { var old = IMG[k]; if (old === im) return; im.style.cssText = old.style.cssText; if (old.id) im.id = old.id; old.parentNode.replaceChild(im, old); IMG[k] = im; }
  function bundleKey(look) { return look.wall + '|' + look.material; }
  function loadBundle(look, token, done) {
    var imgs = { photo: makeImg('photo', WP + look.wall + '.jpg'), bg: makeImg('sheet-bg', WP + look.wall + '-panel.jpg') }, keys, left, allOk = true;
    imgs.mat = makeImg('mat-img', matSrc(look.wall, look.material));
    imgs.field = makeImg('ph-field-img', fieldSrc(look.wall, look.material));
    imgs.fieldAlt = makeImg('ph-field-img', fieldSrc(look.wall, look.material));
    imgs.utility = makeImg('header-material-img', fieldSrc(look.wall, look.material));
    imgs.utilityAlt = makeImg('header-material-img', fieldSrc(look.wall, look.material));
    keys = Object.keys(imgs); left = keys.length;
    keys.forEach(function (k) { whenReady(imgs[k], function (ok) {
      allOk = allOk && ok;
      if (--left || token !== wallToken) return;
      done(allOk ? { key: bundleKey(look), imgs: imgs } : null);
    }); });
  }
  function installBundle(bundle, look, previewOnly) {
    if (bundle) {
      Object.keys(bundle.imgs).forEach(function (k) { if (!previewOnly || k !== 'bg') swapImg(k, bundle.imgs[k]); });
      S.bundleKey = bundle.key;
    }
    S.shown = { bg: look.bg, wall: look.wall, material: look.material, font: look.font };
    phFields.concat(utFields).forEach(function (el) { var p = el._placement; if (p) fieldTransform(el, p.x, p.y, p.width, p.height); });
    S.wallShown = look.wall; S.wallPending = null; S.wallError = null;
  }
  function cleanPatch(patch) {
    var out = {}, k;
    if (!patch || typeof patch !== 'object') throw new Error('look needs an appearance patch');
    for (k in patch) if (patch.hasOwnProperty(k)) {
      if (k === 'wall') { if (!wall(patch[k])) throw new Error('Unknown wallpaper: ' + patch[k]); }
      else if (k === 'pack') { if (!WALL_ENGINE.pack(patch[k])) throw new Error('Unknown pack'); }
      else if (k === 'aspect') { if (['auto', 'day', 'night'].indexOf(patch[k]) < 0) throw new Error('Unknown aspect'); }
      else if (k === 'dayStart' || k === 'nightStart') { if (typeof patch[k] !== 'number' || !isFinite(patch[k]) || patch[k] < 0 || patch[k] >= 1440 || Math.floor(patch[k]) !== patch[k]) throw new Error('Invalid time'); }
      else if (k === 'font') { if (!FONTS[patch[k]] || patch[k] !== 'manrope' && PRIVATE_FONTS.indexOf(patch[k]) < 0) throw new Error('Unavailable font: ' + patch[k]); }
      else if (!LOOK_VALUES[k] || LOOK_VALUES[k].indexOf(patch[k]) < 0) throw new Error('Invalid appearance value: ' + k);
      out[k] = patch[k];
    }
    return out;
  }
  function cancelLook() { wallToken++; S.pending = null; S.wallPending = null; S.lookError = null; }
  function setLook(patch, options) {
    var opts = options || {}, changes = cleanPatch(patch), target = lookOf(S.c), k, token, needs, needsFont, changed, loadedBundle = null, imageDone, fontDone, failed = false;
    for (k in changes) if (changes.hasOwnProperty(k)) target[k] = changes[k];
    if (changes.wall && !changes.pack) target.pack = WALL_ENGINE.locate(changes.wall).pack.id;
    if (target.dayStart === target.nightStart) throw new Error('Day and night times must differ');
    target.wall = resolveWallpaper(target, false);
    changed = Object.keys(target).some(function (key) { return target[key] !== S.c[key]; });
    cancelLook(); S.err = null; token = wallToken;
    function finish(bundle) {
      var c = next(S.c.home.slice(), S.c.recent.slice()), fontChanged = target.font !== S.c.font, reflow = target.apps !== S.c.apps || target.controls !== S.c.controls || fontChanged, frame, fontFrame;
      Object.keys(target).forEach(function (key) { c[key] = target[key]; });
      S.pending = null; S.wallPending = null;
      if (!opts.transient && changed && !write(c, 'Aspecto')) { S.lookError = { type: 'save', patch: changes, row: opts.row || S.appearanceFocus, transient: false }; render(); syncRotation(); return; }
      if (opts.transient) S.c = c;
      if (reflow) { S.reflow = true; frame = ++reflowToken; }
      if (fontChanged) { S.fontSwitch = true; fontFrame = ++fontSwitchToken; }
      installBundle(bundle, target);
      if (bundle) committedBundle = bundle;
      S.lookError = null; S.previewBundle = null;
      render(); syncRotation();
      if (reflow) window.requestAnimationFrame(function () { window.requestAnimationFrame(function () {
        if (frame !== reflowToken) return;
        S.reflow = false; stage.className = stage.className.replace(/\s+is-reflow/g, '');
      }); });
      if (fontChanged) setTimeout(function () {
        if (fontFrame !== fontSwitchToken) return;
        S.fontSwitch = false; stage.className = stage.className.replace(/\s+is-font-switch/g, '');
      }, REDUCED_MOTION ? 130 : 170);
    }
    function fail(type, reason) {
      if (token !== wallToken || failed) return;
      failed = true; S.pending = null; S.wallPending = null;
      if (type === 'load') S.wallError = target.wall;
      S.lookError = { type: type, reason: reason || null, patch: changes, row: opts.row || (type === 'font' ? 'font' : S.appearanceFocus), transient: !!opts.transient, wall: target.wall, font: target.font };
      if (type === 'font') log((opts.startup ? 'font fallback: ' : 'Font kept: ') + (opts.startup ? target.font : FONTS[S.c.font].name) + (opts.startup ? '' : ' (' + reason + ')'));
      if (type === 'font' && opts.startup && target.font !== 'manrope') { setLook({ font: 'manrope' }, { transient: true }); return; }
      render(); syncRotation();
    }
    function complete() {
      if (!imageDone || !fontDone || failed || token !== wallToken) return;
      if (document.hidden) { finish(loadedBundle); return; }
      window.requestAnimationFrame(function () { if (!failed && token === wallToken) finish(loadedBundle); });
    }
    needs = target.bg === 'photo' && S.bundleKey !== bundleKey(target) && (!S.shown || S.shown.bg !== 'photo' || target.wall !== S.c.wall || materialApplies(target));
    needsFont = !fontMetrics[target.font]; imageDone = !needs; fontDone = !needsFont;
    if (!needs && !needsFont) { finish(null); return; }
    S.pending = { patch: changes, target: target, row: opts.row || (needsFont ? 'font' : S.appearanceFocus), transient: !!opts.transient, preview: false };
    if (needs) {
      S.wallPending = target.wall;
      loadBundle(target, token, function (bundle) {
        if (!bundle) { fail('load'); return; }
        loadedBundle = bundle; imageDone = true; complete();
      });
    }
    if (needsFont) ensureFont(target.font, function (ok, reason) {
      if (!ok) { fail('font', reason); return; }
      fontDone = true; complete();
    });
    render();
  }
  function showWall(id, done) {
    var target = lookOf(S.c), token;
    target.bg = 'photo'; target.wall = id;
    cancelLook(); token = wallToken; S.wallError = null;
    S.pending = { patch: { wall: id }, target: target, row: 'bg', preview: true, transient: false }; S.wallPending = id;
    loadBundle(target, token, function (bundle) {
      S.pending = null; S.wallPending = null;
      if (!bundle) { S.wallError = id; done(false); return; }
      S.previewBundle = bundle; installBundle(bundle, target, true); done(true);
    });
    render();
  }
  function restoreLook() {
    cancelLook(); S.previewBundle = null;
    if (S.c.bg === 'photo' && committedBundle && committedBundle.key === bundleKey(S.c)) installBundle(committedBundle, S.c);
    else if (S.c.bg !== 'photo' || S.bundleKey === bundleKey(S.c)) installBundle(null, S.c);
    else setLook({}, { transient: true });
  }

  /* ---------- Lifecycle and remote input ---------- */
  var clockTimer = 0, rotationTimer = 0, activeSince = 0, activeMs = 0, rotationKey = '';
  function rotationActive() { return !document.hidden && !ownerDialogOpen() && top().id === 'home' && S.c.bg === 'photo' && !S.pending && mode().min > 0; }
  function pauseRotation() {
    if (activeSince) { activeMs += Date.now() - activeSince; activeSince = 0; }
    clearTimeout(rotationTimer); rotationTimer = 0;
  }
  function resetRotation() { pauseRotation(); activeMs = 0; rotationKey = ''; }
  function syncRotation() {
    var key = S.c.wall + '|' + S.c.mode;
    pauseRotation();
    if (key !== rotationKey) { activeMs = 0; rotationKey = key; }
    if (!rotationActive()) return;
    activeSince = Date.now();
    rotationTimer = setTimeout(function () {
      pauseRotation(); activeMs = 0;
      if (rotationActive()) setLook({ wall: resolveWallpaper(S.c, true) }, { row: 'bg' });
    }, Math.max(10, mode().min * QA.minuteMs - activeMs));
  }
  function syncWallpaperTime() {
    if (document.hidden || ownerDialogOpen() || S.c.bg !== 'photo' || S.pending || S.previewBundle || top().id === 'wallpaper' || S.lookError || !committedBundle) return;
    var id = resolveWallpaper(S.c, false);
    if (id !== S.c.wall) setLook({ wall: id }, { row: 'aspect' });
  }
  function updateClock() {
    clearTimeout(clockTimer);
    if (document.hidden) return;
    syncWallpaperTime();
    if (top().id === 'home' || isSettingsDetail(top())) { renderCaption(top(), homeState(top())); alignDockHeader(homeState(top())); }
    clockTimer = setTimeout(updateClock, 60000 - (Date.now() % 60000) + 30);
  }
  function focusStage() { if (ownerDialogOpen()) return; try { stage.focus({ preventScroll: true }); } catch (e) { stage.focus(); } }
  function after() {
    norm(); var t = top();
    if (t.group === 'inputs' && t.refreshInputs && !t.loading && !document.hidden) { t.refreshInputs = false; loadInputs(t); }
    render(); syncRotation(); syncWallpaperTime();
  }
  function refreshInputsOnReturn() { var t = top(); if (t.group === 'inputs' && !t.loading) t.refreshInputs = true; }
  function goScene(name) {
    FrameDevice.cancelSource();
    if (top().id === 'wallpaper') cancelWallpaperTimer(top());
    S.stack = [S.stack[0]]; S.stack[0].f.zone = 'apps'; clearSession(); restoreLook();
    if (name === 'apps') openApps();
    else if (name === 'settings') openSettings();
    else if (name === 'appearance') { openSettings(); top().f.id = 'background'; S.settingsFocus = 'background'; openAppearance('background'); }
    else if (name === 'editor') { openSettings(); openEditor('settings'); }
    after();
  }
  function fit() {
    var scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = 'scale(' + scale + ')';
    stage.style.left = ((window.innerWidth - 1920 * scale) / 2) + 'px';
    stage.style.top = ((window.innerHeight - 1080 * scale) / 2) + 'px';
  }
  function renderedAction(el) {
    return el.getClientRects().length > 0 && window.getComputedStyle(el).visibility !== 'hidden';
  }
  function focusedAction() {
    if (top().nav !== undefined && top().nav !== null) return top().nav === 0 ? 'panel.back' : 'panel.home';
    var root = isSettingsDetail(top()) ? appearanceEl : sheetEl.hidden ? homeEl : sheetEl, els = root.querySelectorAll('.is-focus[data-action]'), i;
    for (i = 0; i < els.length; i++) if (renderedAction(els[i])) return els[i].getAttribute('data-action');
    return null;
  }
  function activate(action) {
    if (action === 'settings.back' || action === 'wallpaper.back') action = 'panel.back';
    if ((action === 'panel.back' || action === 'panel.home') && top().id !== 'home') { panelAction(action === 'panel.home' ? 'home' : 'back'); return true; }
    var root = isSettingsDetail(top()) ? appearanceEl : sheetEl.hidden ? homeEl : sheetEl, els = root.querySelectorAll('[data-action]'), i;
    if (action === 'appearance.bg' && top().id === 'appearance' && top().group === 'background') action = 'background.wallpaper';
    if (action === 'settings.appearance' && top().id === 'settings') action = 'settings.group.background';
    for (i = 0; i < els.length; i++) if (renderedAction(els[i]) && els[i].getAttribute('data-action') === action) { pointAt(els[i]); return true; }
    return false;
  }
  function pointAt(el) {
    var t = top(), v = V[t.id];
    if (el.getAttribute('data-z') === 'panel-nav') { panelAction(el.getAttribute('data-i') === '1' ? 'home' : 'back'); return; }
    t.nav = null;
    norm();
    if (v.point) v.point(t, el.getAttribute('data-z'), +el.getAttribute('data-i'), el.getAttribute('data-id'));
    norm();
    render();
    syncRotation();
  }

  utilsEl.addEventListener('mouseover', function (ev) {
    var b = ev.target, t = top(), z, i;
    if (utilsEl.className.indexOf('quiet-utils') < 0 || t.lifted) return;
    while (b && b !== utilsEl && !(b.getAttribute && b.getAttribute('data-z'))) b = b.parentNode;
    if (!b || b === utilsEl || (ev.relatedTarget && b.contains(ev.relatedTarget))) return;
    z = b.getAttribute('data-z'); i = Number(b.getAttribute('data-i'));
    if ((t.id !== 'home' || z !== 'util') && (t.id !== 'arrange' || z !== 'ctl')) return;
    if (t.f.zone === z && t.f.u === i) return;
    t.f.zone = z; t.f.u = i;
    if (z === 'util') S.lastUtil = i;
    render();
  });
  stage.addEventListener('click', function (ev) {
    var el = ev.target;
    while (el && el !== stage && !(el.getAttribute && el.getAttribute('data-z'))) el = el.parentNode;
    focusStage();
    if (!el || el === stage) return;
    pointAt(el);
  });
  var heldKeys = {};
  document.addEventListener('keydown', function (ev) {
    var code = ev.keyCode, k = KEYS[code];
    if (code === 9) { ev.preventDefault(); return; }
    if (handleOwnerDialogKey(ev)) return;
    if (top().id === 'hdmiName' && !panelFocused(top()) && !ev.metaKey && !ev.ctrlKey && !ev.altKey && (code === 8 || ev.key && ev.key.length === 1 && code !== 13)) {
      ev.preventDefault();
      if (code === 8) top().value = top().value.slice(0, -1);
      else if (top().value.length < 40 && !/[\x00-\x1f\x7f]/.test(ev.key)) top().value += ev.key;
      top().error = ''; render(); return;
    }
    if (!k || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    ev.preventDefault();
    if (k === 'ok' || k === 'back') { if (ev.repeat || heldKeys[code]) return; heldKeys[code] = true; }
    press(k);
  });
  document.addEventListener('keyup', function (ev) { delete heldKeys[ev.keyCode]; });
  window.addEventListener('blur', function () { heldKeys = {}; });
  window.addEventListener('focus', function () { FrameDevice.cancelSource(); release(); refreshInputsOnReturn(); refreshCatalog(); focusStage(); after(); updateClock(); });
  document.addEventListener('visibilitychange', function () {
    heldKeys = {};
    if (document.hidden) { FrameDevice.cancelSource(); pauseRotation(); clearTimeout(clockTimer); }
    else {
      release();
      if (S.c.bg === 'photo' && !S.pending && !S.previewBundle && (!committedBundle || S.bundleKey !== bundleKey(S.c))) setLook({}, { transient: true, startup: true });
      refreshInputsOnReturn(); refreshCatalog(); after(); updateClock(); focusStage();
    }
  });
  window.addEventListener('resize', fit);

  /* Readable browser checks use the real state and actions, without fake outcomes. */
  var NAV = { left: 'left', right: 'right', up: 'up', down: 'down', ok: 'ok', enter: 'ok', back: 'back', escape: 'back' };
  QA.state = function () {
    var out = serialise(S.c), t = top(), item = t.id === 'appearance' ? detailLocation(t).item : null;
    out.committed = S.c; out.shown = S.shown; out.pending = S.pending; out.view = t.id; out.selected = S.sel;
    out.focusAction = focusedAction(); out.writes = S.writes; out.failedWrites = S.failed; out.error = S.err;
    out.catalog = { loading: catalog.loading, loaded: catalog.loaded, error: catalog.error, ids: ALPHA.slice() };
    out.fonts = { available: LOOK_VALUES.font.slice(), loaded: Object.keys(fontMetrics).filter(function (id) { return !fontMetrics[id].fallback; }), baselineFallback: !!(fontMetrics.manrope && fontMetrics.manrope.fallback), error: S.lookError && S.lookError.type === 'font' ? S.lookError : null };
    out.rotation = { activeMs: activeMs + (activeSince ? Date.now() - activeSince : 0), active: !!activeSince };
    out.draft = t.lifted ? { id: t.lifted.id, order: t.lifted.order.slice() } : null;
    out.settingsGroup = t.id === 'wallpaper' ? 'wallpaper' : t.id === 'appearance' ? t.group : null;
    out.focusedChoice = item && item.axis ? { axis: item.axis, value: item.value, action: item.action, disabled: item.disabled } : null;
    out.candidate = out.focusedChoice ? { axis: item.axis, value: item.value, action: item.action, pending: !!S.pending, pendingTarget: S.pending ? S.pending.target : null } : null;
    out.wallpaperPicker = t.id === 'wallpaper' ? { candidate: WALLS[t.i].id, applied: S.c.wall, shown: S.wallShown, pending: t.previewDue || S.wallPending,
      queuedApplying: !!t.applyPending, applyPending: t.applyPending, failed: t.failedId, zone: t.f.zone, top: t.top, visible: WALL_VISIBLE, backdrop: IMG.bg.src } : null;
    out.undo = S.undo.map(function (u) { return u.label; }); out.storageOk = storageOk;
    return JSON.parse(JSON.stringify(out));
  };
  QA.where = function () {
    var action = focusedAction(), active = stage.querySelectorAll('.is-focus[data-action]'), count = 0, name = '';
    Array.prototype.forEach.call(active, function (el) { if (renderedAction(el)) { count++; if (el.getAttribute('data-action') === action) name = el.getAttribute('aria-label') || el.textContent.replace(/\s+/g, ' ').trim(); } });
    return { view: top().id, settingsGroup: top().id === 'wallpaper' ? 'wallpaper' : top().id === 'appearance' ? top().group : null, focus: name, focusAction: action, focusCount: count, wallpaper: S.wallShown, zone: top().f.zone || null };
  };
  QA.wallpaperTick = function () { syncWallpaperTime(); return QA.state(); };
  QA.ready = function () { return fontsReady && !S.pending && !!S.shown && S.shown.bg === S.c.bg && S.shown.wall === S.c.wall && S.shown.font === S.c.font; };
  QA.nav = function () { var keys = arguments.length === 1 && Array.isArray(arguments[0]) ? arguments[0] : Array.prototype.slice.call(arguments); keys.forEach(function (key) { if (!NAV[key]) throw new Error('Unknown key'); press(NAV[key]); }); return QA.state(); };
  QA.look = function (patch) { setLook(patch, {}); return QA.state(); };
  QA.scene = function (name) { if (['home', 'apps', 'settings', 'appearance', 'editor'].indexOf(name) < 0) throw new Error('Unknown view'); goScene(name); return QA.state(); };
  QA.activate = function (action) { return activate(action) ? QA.state() : null; };
  QA.actions = function () { var view = isSettingsDetail(top()) ? appearanceEl : sheetEl.hidden ? homeEl : sheetEl; return Array.prototype.filter.call(Array.prototype.slice.call(view.querySelectorAll('[data-action]')).concat(Array.prototype.slice.call(panelNav.querySelectorAll('[data-action]'))), renderedAction).map(function (el) { return el.getAttribute('data-action'); }); };

  /* Bedroom owner controls: real installed apps and live TV. */
  var liveDialog = document.getElementById('liveTVDialog'), liveStatus = document.getElementById('liveTVStatus');
  var liveChannels = document.getElementById('liveTVChannels'), liveSequence = 0, liveTuneSequence = 0, channelTimer = 0;
  var liveInfoSequence = 0, liveInfoTimer = 0;
  var liveChannelRecords = [], liveChannelsLoading = false;
  function resumeLivePreview() {
    var sequence = liveSequence, rect = document.getElementById('liveTVFrame').getBoundingClientRect();
    FrameDevice.previewTV([Math.round(rect.left) + 'px', Math.round(rect.top) + 'px', Math.round(rect.width) + 'px', Math.round(rect.height) + 'px'], function (err) {
      if (sequence !== liveSequence || liveDialog.hidden || window.FrameGuide.isOpen()) return;
      liveStatus.textContent = err ? err.message : 'Emisión en directo';
      if (!err) loadLiveProgram(null, sequence);
    });
  }
  document.getElementById('liveTVGuide').addEventListener('click', function () {
    if (!liveChannelRecords.length) { liveStatus.textContent = liveChannelsLoading ? 'Espera a que termine de cargar la lista de canales.' : 'No hay canales disponibles. Sintonízalos en los ajustes de Samsung para usar la guía.'; return; }
    var sequence = liveSequence;
    liveTuneSequence++;clearTimeout(channelTimer);resetLiveProgram();
    FrameDevice.hidePreview(function (err) {
      if (sequence !== liveSequence || liveDialog.hidden) return;
      if (err) { liveStatus.textContent = err.message; return; }
      liveDialog.classList.add('guide-open');
      window.FrameGuide.open(liveChannelRecords, function (resume) {
        liveDialog.classList.remove('guide-open');
        if (resume && !liveDialog.hidden) { document.getElementById('liveTVGuide').focus();resumeLivePreview(); }
      }, function (channel) {
        window.FrameGuide.close(false);
        var tuneSequence = ++liveTuneSequence;
        FrameDevice.tuneChannel(channel, function (tuneError) {
          if (sequence !== liveSequence || tuneSequence !== liveTuneSequence || liveDialog.hidden) return;
          if (tuneError) { liveStatus.textContent = tuneError.message;resumeLivePreview(); }
          else fullscreenLiveTV();
        });
      });
    });
  });
  function resetLiveProgram(title) {
    liveInfoSequence++; clearTimeout(liveInfoTimer);
    document.getElementById('liveTVProgramTitle').textContent = title || 'Consultando programación…';
    document.getElementById('liveTVProgramTime').textContent = '';
    document.getElementById('liveTVDescription').textContent = '';
    document.getElementById('liveTVDescription').scrollTop = 0;
    document.getElementById('liveTVNext').textContent = '';
    document.getElementById('liveTVProgress').hidden = true;
  }
  function loadLiveProgram(channel, sequence) {
    var request = ++liveInfoSequence;
    clearTimeout(liveInfoTimer);
    FrameDevice.programs(channel, function (err, data) {
      if (request !== liveInfoSequence || sequence !== liveSequence || liveDialog.hidden) return;
      var current = !err && data && data.current, next = !err && data && data.next;
      function time(value) { var d = new Date(value); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
      document.getElementById('liveTVProgramTitle').textContent = current ? current.title : 'Información no disponible';
      document.getElementById('liveTVProgramTime').textContent = current ? time(current.start) + ' – ' + time(current.end) : '';
      var description = document.getElementById('liveTVDescription'), progress = document.getElementById('liveTVProgress');
      var text = current ? current.description || 'La cadena no ofrece una descripción de este programa.' : 'La cadena todavía no ha facilitado la programación. Puedes seguir viendo este canal.';
      if (description.textContent !== text) { description.textContent = text; description.scrollTop = 0; }
      progress.hidden = !current;
      if (current) progress.firstElementChild.style.width = clamp((Date.now() - current.start) / (current.end - current.start) * 100, 0, 100) + '%';
      document.getElementById('liveTVNext').textContent = next ? 'Después · ' + time(next.start) + '  ' + next.title : '';
      liveInfoTimer = setTimeout(function () { loadLiveProgram(channel, sequence); }, 30000);
    });
  }
  function ownerDialogOpen() { return liveDialog && !liveDialog.hidden; }
  function seedInstalledCatalog() {
    var saved = load(), seed = window.CleanFrameInstalledApps || [], records = saved && saved.appRecords;
    if (saved && Array.isArray(saved.availableApps) && Array.isArray(records)) seed = records.filter(function (record) { return saved.availableApps.indexOf(record.id) >= 0; });
    seed.forEach(function (entry) {
      if (!safeId(entry.appId) || typeof entry.name !== 'string') return;
      var id = PRIMARY.indexOf(entry.brand) >= 0 ? entry.brand : entry.id || entry.appId, a = app(id);
      if (!safeId(id) || ALPHA.indexOf(id) >= 0) return;
      if (!a) { a = { id: id }; APPS.push(a); }
      if (entry.id && entry.id.indexOf('hdmi.') === 0 && !sourceShortcut(entry)) return;
      if (sourceShortcut(entry)) { a.sourceNumber = entry.sourceNumber; a.sourceName = entry.sourceName || entry.name; }
      a.appId = entry.appId; a.name = sourceShortcut(a) ? inputAliases[String(a.sourceNumber)] || entry.name : entry.name; a.brand = entry.brand || ''; a.mark = !!a.brand; a.icon = safeIcon(entry.icon || '');
      ALPHA.push(id);
    });
    catalog.loaded = ALPHA.length > 0;
    ensureLiveShortcut();
  }
  function closeLiveTV(then) {
    if (window.FrameGuide.isOpen()) window.FrameGuide.close(false);
    resetLiveProgram();
    liveSequence++; liveTuneSequence++; clearTimeout(channelTimer); liveDialog.hidden = true;
    FrameDevice.hidePreview(function (err) { if (then) then(err); });
    focusStage(); after();
  }
  function fullscreenLiveTV() {
    var sequence = liveSequence + 1;
    closeLiveTV(function (err) {
      if (sequence !== liveSequence || !liveDialog.hidden) return;
      if (err) { message('TV en directo', err.message || 'No se pudo cerrar la vista previa.'); return; }
      perform('TV en directo', FrameDevice.liveTV);
    });
  }
  function loadLiveChannels(sequence) {
    var listStatus = document.getElementById('liveTVListStatus'), count = document.getElementById('liveTVCount');
    liveChannels.textContent = ''; count.textContent = ''; listStatus.textContent = 'Cargando canales…';
    liveChannelRecords = [];liveChannelsLoading = true;
    FrameDevice.channels(function (channelError, list) {
      if (sequence !== liveSequence || liveDialog.hidden) return;
      liveChannelsLoading = false;
      if (channelError) { listStatus.textContent = channelError.message; return; }
      if (!list || !list.length) { listStatus.textContent = 'No se han recibido canales sintonizados.'; return; }
      liveChannelRecords = list.filter(function (channel) { return typeof channel.major === 'number'; });
      var shown = 0;
      list.forEach(function (channel) {
        if (typeof channel.major !== 'number') return;
        var button = document.createElement('button'), number = document.createElement('span'), label = document.createElement('span');
        button.type = 'button'; button.className = 'live-tv-channel'; button.setAttribute('aria-pressed', 'false');
        number.className = 'live-tv-channel-number'; number.textContent = String(channel.major);
        label.className = 'live-tv-channel-name'; label.textContent = channel.channelName || channel.serviceName || 'Canal ' + channel.major;
        button.appendChild(number); button.appendChild(label); shown++;
        function selectChannel(fullscreen) {
          var tuneSequence = ++liveTuneSequence;
          FrameDevice.tuneChannel(channel, function (tuneError) {
            if (sequence !== liveSequence || tuneSequence !== liveTuneSequence || liveDialog.hidden) return;
            liveStatus.textContent = tuneError ? tuneError.message : label.textContent;
            if (tuneError) resetLiveProgram('No se pudo consultar este canal');
            if (!tuneError) {
              Array.prototype.forEach.call(liveChannels.querySelectorAll('button'), function (item) { item.setAttribute('aria-pressed', String(item === button)); });
              if (fullscreen) fullscreenLiveTV();
              else loadLiveProgram(channel, sequence);
            }
          });
        }
        button.addEventListener('click', function () { clearTimeout(channelTimer); selectChannel(true); });
        button.addEventListener('focus', function () {
          resetLiveProgram('Seleccionando ' + label.textContent + '…');
          liveTuneSequence++; clearTimeout(channelTimer);
          if (button.offsetTop < liveChannels.scrollTop) liveChannels.scrollTop = button.offsetTop;
          if (button.offsetTop + button.offsetHeight > liveChannels.scrollTop + liveChannels.clientHeight) liveChannels.scrollTop = button.offsetTop + button.offsetHeight - liveChannels.clientHeight;
          channelTimer = setTimeout(function () { selectChannel(false); }, 650);
        });
        liveChannels.appendChild(button);
      });
      count.textContent = String(shown); listStatus.textContent = shown ? '' : 'La TV no ha devuelto canales utilizables.';
    });
  }
  function openLiveTV() {
    var sequence = ++liveSequence, initialTune = liveTuneSequence, photo = S.c.bg === 'photo', background = wall(S.c.wall);
    liveDialog.className = 'owner-dialog live-tv-dialog' + (S.c.bg === 'light' || photo && background.daylight ? ' is-day' : '');
    liveDialog.style.backgroundImage = photo ? 'url("assets/wallpapers/' + background.id + '.jpg")' : 'none';
    liveDialog.hidden = false; liveStatus.textContent = 'Preparando la emisión…';
    resetLiveProgram();
    document.getElementById('liveTVClose').focus();
    loadLiveChannels(sequence);
    window.requestAnimationFrame(function () {
      var rect = document.getElementById('liveTVFrame').getBoundingClientRect();
      FrameDevice.previewTV([Math.round(rect.left) + 'px', Math.round(rect.top) + 'px', Math.round(rect.width) + 'px', Math.round(rect.height) + 'px'], function (err) {
        if (sequence !== liveSequence || liveDialog.hidden) return;
        liveStatus.textContent = err ? err.message : 'Emisión en directo';
        if (!err && liveTuneSequence === initialTune) loadLiveProgram(null, sequence);
      });
    });
  }
  document.getElementById('liveTVRetry').addEventListener('click', function () { clearTimeout(channelTimer); loadLiveChannels(liveSequence); });
  document.getElementById('liveTVClose').addEventListener('click', function () { closeLiveTV(); });
  document.getElementById('liveTVFullscreen').addEventListener('click', fullscreenLiveTV);
  function handleOwnerDialogKey(event) {
    if (!ownerDialogOpen()) return false;
    if (window.FrameGuide.isOpen()) return window.FrameGuide.key(event);
    var dialog = liveDialog, code = event.keyCode;
    if (code === 27 || code === 10009 || code === 461) { event.preventDefault(); closeLiveTV(); return true; }
    if ([37, 38, 39, 40].indexOf(code) >= 0) {
      event.preventDefault();
      var description = document.getElementById('liveTVDescription');
      if (document.activeElement === description) {
        if (code === 37) {
          var selected = liveChannels.querySelector('[aria-pressed="true"]') || liveChannels.querySelector('button');
          if (selected) selected.focus(); else document.getElementById('liveTVClose').focus();
        } else if (code === 38 && description.scrollTop <= 0) document.getElementById('liveTVFullscreen').focus();
        else if (code === 38 || code === 40) description.scrollTop += code === 38 ? -48 : 48;
        return true;
      }
      if (document.activeElement === document.getElementById('liveTVFullscreen') && code === 40) { description.focus(); return true; }
      if (document.activeElement === document.getElementById('liveTVFullscreen') && code === 38) { document.getElementById('liveTVGuide').focus(); return true; }
      if (document.activeElement === document.getElementById('liveTVClose') && code === 39) { document.getElementById('liveTVGuide').focus(); return true; }
      var controls = Array.prototype.slice.call(dialog.querySelectorAll('input,button')), i = controls.indexOf(document.activeElement);
      if (dialog === liveDialog) {
        var rows = Array.prototype.slice.call(liveChannels.querySelectorAll('button')), row = rows.indexOf(document.activeElement);
        if (row >= 0) {
          if (code === 39) document.getElementById('liveTVFullscreen').focus();
          else if (code === 37) document.getElementById('liveTVClose').focus();
          else if (code === 38 && row === 0) document.getElementById('liveTVClose').focus();
          else if (code === 40 && row === rows.length - 1) document.getElementById('liveTVRetry').focus();
          else rows[clamp(row + (code === 38 ? -1 : 1), 0, rows.length - 1)].focus();
        } else if ((code === 40 || code === 37) && rows.length) rows[0].focus();
        else if (code === 39) document.getElementById('liveTVFullscreen').focus();
        else if (code === 38) document.getElementById('liveTVClose').focus();
        else document.getElementById('liveTVRetry').focus();
      } else {
        i = clamp(i + (code === 37 || code === 38 ? -1 : 1), 0, controls.length - 1); controls[i].focus();
      }
    } else if (code === 13 && event.target && event.target.tagName === 'BUTTON') { event.preventDefault(); if (!event.repeat) event.target.click(); }
    return true;
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden && liveDialog && !liveDialog.hidden) closeLiveTV(); });

  /* ---------- Start ---------- */
  cueL.innerHTML = icon('left'); cueR.innerHTML = icon('right');
  loadInputAliases();
  seedInstalledCatalog();
  initialise();
  setLook({}, { transient: true, startup: true });
  norm(); render(); fit(); focusStage(); updateClock(); syncRotation();
  refreshCatalog();
})();
