/* Offline broadcaster EPG. Focus only consults; tuning is an explicit action. */
(function () {
  'use strict';
  var panel = document.getElementById('programmeGuide'), rows = document.getElementById('guideRows');
  var channels = [], page = 0, start = 0, generation = 0, selected = 0, anchor = 0, data = {}, closeAction, watchAction;
  var span = 10800000, size = 6, open = false;
  function el(id) { return document.getElementById(id); }
  function time(ms) { var d = new Date(ms); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function showDetails(index, programme) {
    selected = index;
    el('guideWatch').disabled = false;
    if (programme) anchor = Math.max(start, programme.start);
    el('guideTitle').textContent = programme ? programme.title : channels[index].channelName || 'Canal ' + channels[index].major;
    el('guideTime').textContent = programme ? time(programme.start) + ' – ' + time(programme.end) : '';
    el('guideDescription').textContent = programme ? programme.description || 'La cadena no ofrece una descripción de este programa.' : 'Programación no disponible para este canal y horario. Puedes usar Ver canal para sintonizarlo.';
    el('guideDescription').scrollTop = 0;
  }
  function buttons(index) { return rows.querySelectorAll('[data-channel="' + index + '"]'); }
  function focusRow(index) {
    var list = buttons(index), best = null, distance = Infinity;
    Array.prototype.forEach.call(list, function (button) {
      var a = Number(button.getAttribute('data-start')), b = Number(button.getAttribute('data-end'));
      var delta = a <= anchor && b > anchor ? 0 : Math.abs(a - anchor);
      if (delta < distance) { distance = delta; best = button; }
    });
    if (best) best.focus();
  }
  function renderRow(index) {
    var row = el('guideRow' + index), hadFocus = row.contains(document.activeElement), track = row.querySelector('.guide-track');
    track.textContent = '';
    var programmes = data[index], visible = programmes && programmes.filter(function (p) { return p.end > start && p.start < start + span; });
    function add(programme) {
      var button = document.createElement('button');button.type = 'button';
      button.setAttribute('data-channel', String(index));
      button.setAttribute('data-start', String(programme ? programme.start : start));
      button.setAttribute('data-end', String(programme ? programme.end : start + span));
      button.className = 'guide-programme';
      var left = programme ? Math.max(0, programme.start - start) / span * 100 : 0;
      var right = programme ? Math.min(span, programme.end - start) / span * 100 : 100;
      button.style.left = left + '%';button.style.width = (right - left) + '%';
      button.textContent = programme ? programme.title : programmes ? 'Sin programación' : 'Consultando…';
      button.addEventListener('focus', function () { showDetails(index, programme); });
      button.addEventListener('click', function () { showDetails(index, programme);el('guideWatch').focus(); });
      track.appendChild(button);
    }
    if (visible && visible.length) visible.forEach(add); else add(null);
    if (hadFocus) focusRow(index);
  }
  function render(focus) {
    var token = ++generation, first = page * size, end = Math.min(channels.length, first + size), index;
    rows.textContent = ''; data = {};
    el('guideHours').textContent = '';
    for (index = 0; index < 6; index++) {
      var hour = document.createElement('span');hour.textContent = time(start + index * 1800000);el('guideHours').appendChild(hour);
    }
    var date = new Date(start);
    el('guideDate').textContent = date.getDate() + '/' + (date.getMonth() + 1) + ' · ' + time(start) + ' – ' + time(start + span);
    el('guidePage').textContent = (first + 1) + '–' + end + ' de ' + channels.length;
    el('guideUp').disabled = first === 0;el('guideDown').disabled = end === channels.length;
    for (index = first; index < end; index++) {
      var row = document.createElement('div'), label = document.createElement('div'), track = document.createElement('div');
      row.id = 'guideRow' + index;row.className = 'guide-row';label.className = 'guide-channel';track.className = 'guide-track';
      label.textContent = channels[index].major + '  ' + (channels[index].channelName || channels[index].serviceName || 'Canal');
      row.appendChild(label);row.appendChild(track);rows.appendChild(row);renderRow(index);
    }
    selected = Math.max(first, Math.min(end - 1, selected));
    if (focus) focusRow(selected);
    function query(i) {
      if (!open || token !== generation || i >= end) return;
      window.FrameDevice.programs(channels[i], function (err, result) {
        if (!open || token !== generation) return;
        data[i] = !err && result && Array.isArray(result.schedule) ? result.schedule : [];
        renderRow(i);query(i + 1);
      }, { start: start });
    }
    query(first);
  }
  function shift(direction) {
    var candidate = start + direction * span, now = Date.now();
    if (candidate < now - 86400000 || candidate > now + 86400000) return;
    start = candidate;anchor = start;render(true);
  }
  function close(resume) {
    if (!open) return;
    open = false;generation++;panel.hidden = true;
    if (closeAction) closeAction(resume !== false);
  }
  el('guideBack').addEventListener('click', function () { close(true); });
  el('guideEarlier').addEventListener('click', function () { shift(-1); });
  el('guideLater').addEventListener('click', function () { shift(1); });
  el('guideNow').addEventListener('click', function () { start = Math.floor(Date.now() / 1800000) * 1800000;anchor = Date.now();render(true); });
  el('guideUp').addEventListener('click', function () { if (page > 0) { page--;selected = page * size;render(true); } });
  el('guideDown').addEventListener('click', function () { if ((page + 1) * size < channels.length) { page++;selected = page * size;render(true); } });
  el('guideWatch').addEventListener('click', function () { if (channels[selected] && watchAction) watchAction(channels[selected]); });
  function key(event) {
    if (!open) return false;
    var code = event.keyCode, active = document.activeElement;
    if ([27, 10009, 461].indexOf(code) >= 0) { event.preventDefault();close(true);return true; }
    if (code === 13) { event.preventDefault();if (!event.repeat && active.tagName === 'BUTTON') active.click();return true; }
    if ([37, 38, 39, 40].indexOf(code) < 0) return true;
    event.preventDefault();
    if (active === el('guideDescription')) {
      if (code === 38 && active.scrollTop === 0) el('guideWatch').focus();
      else if (code === 37) focusRow(selected);
      else active.scrollTop += code === 38 ? -48 : 48;
    } else if (active.hasAttribute('data-channel')) {
      var row = Number(active.getAttribute('data-channel')), list = Array.prototype.slice.call(buttons(row)), i = list.indexOf(active);
      if (code === 37 || code === 39) {
        var next = i + (code === 37 ? -1 : 1);
        if (next >= 0 && next < list.length) list[next].focus();else shift(code === 37 ? -1 : 1);
      } else {
        var target = row + (code === 38 ? -1 : 1);
        if (target < 0) el('guideBack').focus();
        else if (target >= channels.length) el('guideWatch').focus();
        else if (Math.floor(target / size) !== page) { selected = target;page = Math.floor(target / size);render(true); }
        else focusRow(target);
      }
    } else if (code === 40 && active === el('guideWatch')) el('guideDescription').focus();
    else if (code === 40 || code === 38) focusRow(selected);
    else {
      var nav = Array.prototype.slice.call(panel.querySelectorAll('button:not([disabled]):not(.guide-programme)')), pos = nav.indexOf(active);
      nav[Math.max(0, Math.min(nav.length - 1, pos + (code === 37 ? -1 : 1)))].focus();
    }
    return true;
  }
  window.FrameGuide = { isOpen: function () { return open; }, key: key, close: close,
    open: function (list, onClose, onWatch) {
      channels = list.slice();if (!channels.length) return false;
      closeAction = onClose;watchAction = onWatch;open = true;page = 0;selected = 0;
      el('guideTitle').textContent = 'Selecciona un programa';el('guideTime').textContent = '';
      el('guideDescription').textContent = 'Recorre la parrilla para consultar la descripción. Ver canal sintoniza la emisión en directo.';
      el('guideDescription').scrollTop = 0;el('guideWatch').disabled = true;
      start = Math.floor(Date.now() / 1800000) * 1800000;anchor = Date.now();panel.hidden = false;
      render(false);el('guideBack').focus();return true;
    } };
})();
