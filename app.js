/* Nuclear Power Plants Worldwide — interactive map */
(function () {
  'use strict';

  var STATUS_COLORS = {
    'Operational': '#16a34a',
    'Under construction': '#f59e0b',
    'Planned': '#3b82f6',
    'Shut down': '#6b7280',
    'Other': '#a855f7'
  };
  var STATUS_ORDER = ['Operational', 'Under construction', 'Planned', 'Shut down', 'Other'];

  var map = L.map('map', { worldCopyJump: true }).setView([28, 10], 2);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var cluster = L.markerClusterGroup({
    maxClusterRadius: 48,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false
  });
  map.addLayer(cluster);

  var plants = [];
  var activeStatuses = new Set(STATUS_ORDER);
  var query = '';

  function fmt(n) {
    return (n === null || n === undefined || n === '') ? '—'
      : Number(n).toLocaleString('en-US');
  }

  function radiusFor(cap) {
    if (!cap) return 4;
    return 4 + 8 * Math.sqrt(cap / 9000);
  }

  function tooltipHtml(p) {
    var rows = [
      '<b>' + esc(p.name) + '</b>',
      '<span class="muted">' + esc(p.province ? p.province + ', ' + p.country : p.country) + '</span>',
      'Units: <b>' + p.units + '</b> &nbsp;·&nbsp; ' + fmt(p.capacity_mw) + ' MW',
      esc(p.status_summary)
    ];
    if (p.types) rows.push(esc(p.types));
    if (p.owner) rows.push('Owner: ' + esc(p.owner));
    if (p.operator) rows.push('Operator: ' + esc(p.operator));
    if (p.gen_twh !== null && p.gen_twh !== undefined)
      rows.push(fmt(p.gen_twh) + ' TWh' + (p.gen_year ? ' (' + p.gen_year + ')' : ''));
    rows.push('<span class="muted">Click for details</span>');
    return rows.join('<br>');
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function panelHtml(p) {
    function row(label, value) {
      if (value === null || value === undefined || value === '') return '';
      return '<dt>' + label + '</dt><dd>' + esc(value) + '</dd>';
    }
    var gen = (p.gen_twh !== null && p.gen_twh !== undefined)
      ? fmt(p.gen_twh) + ' TWh' + (p.gen_year ? ' (' + p.gen_year + ')' : '') : '';
    var cf = (p.cap_factor !== null && p.cap_factor !== undefined) ? p.cap_factor + ' %' : '';
    return '<h2>' + esc(p.name) + '</h2>' +
      '<div class="loc">' + esc(p.province ? p.province + ', ' + p.country : p.country) + '</div>' +
      '<dl>' +
      row('Status', p.status_summary) +
      row('Units', p.units) +
      row('Net capacity', fmt(p.capacity_mw) + ' MW') +
      row('Reactor type(s)', p.types) +
      row('Reactor model(s)', p.models) +
      row('Owner', p.owner) +
      row('Operator', p.operator) +
      row('Annual generation', gen) +
      row('Capacity factor', cf) +
      row('Construction start', p.construction_start) +
      row('First commercial operation', p.first_commercial) +
      row('Expected retirement / closure', p.retirement) +
      row('Notes', p.notes) +
      '</dl>' +
      (p.coord_approx ? '<div class="approx">⚠ Location is approximate (city/region level).</div>' : '');
  }

  function makeMarker(p) {
    var color = STATUS_COLORS[p.primary_status] || STATUS_COLORS.Other;
    var m = L.circleMarker([p.lat, p.lng], {
      radius: radiusFor(p.capacity_mw),
      color: '#fff',
      weight: 1.2,
      fillColor: color,
      fillOpacity: 0.8
    });
    m.bindTooltip(tooltipHtml(p), {
      direction: 'top',
      offset: [0, -6],
      className: 'plant-tip',
      sticky: true
    });
    m.on('click', function () {
      document.getElementById('panel-body').innerHTML = panelHtml(p);
      document.getElementById('panel').classList.remove('hidden');
    });
    return m;
  }

  function matches(p) {
    if (!activeStatuses.has(p.primary_status)) return false;
    if (query) {
      var hay = (p.name + ' ' + p.country + ' ' + (p.province || '')).toLowerCase();
      if (hay.indexOf(query) === -1) return false;
    }
    return true;
  }

  function refresh() {
    cluster.clearLayers();
    var shown = 0, totalCap = 0;
    plants.forEach(function (p) {
      if (p.lat === null || !matches(p)) return;
      cluster.addLayer(makeMarker(p));
      shown++;
      totalCap += (p.capacity_mw || 0);
    });
    var missing = plants.filter(function (p) { return p.lat === null; }).length;
    var sub = shown + ' of ' + plants.length + ' plants shown · ' +
      fmt(Math.round(totalCap)) + ' MW listed capacity';
    if (missing) sub += ' · ' + missing + ' without coordinates';
    document.getElementById('subtitle').textContent = sub;
  }

  function buildFilters() {
    var wrap = document.getElementById('status-filters');
    STATUS_ORDER.forEach(function (s) {
      var label = document.createElement('label');
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = true;
      cb.addEventListener('change', function () {
        if (cb.checked) activeStatuses.add(s); else activeStatuses.delete(s);
        refresh();
      });
      var dot = document.createElement('span');
      dot.className = 'dot';
      dot.style.background = STATUS_COLORS[s];
      label.appendChild(cb);
      label.appendChild(dot);
      label.appendChild(document.createTextNode(' ' + s));
      wrap.appendChild(label);
    });
    var legend = document.getElementById('legend');
    STATUS_ORDER.forEach(function (s) {
      var n = plants.filter(function (p) { return p.primary_status === s; }).length;
      var span = document.createElement('span');
      var dot = document.createElement('span');
      dot.className = 'dot';
      dot.style.background = STATUS_COLORS[s];
      span.appendChild(dot);
      span.appendChild(document.createTextNode(' ' + s + ' (' + n + ')'));
      legend.appendChild(span);
    });
  }

  document.getElementById('search').addEventListener('input', function (e) {
    query = e.target.value.trim().toLowerCase();
    refresh();
  });
  document.getElementById('panel-close').addEventListener('click', function () {
    document.getElementById('panel').classList.add('hidden');
  });

  fetch('plants.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      plants = data.plants;
      document.getElementById('subtitle').textContent =
        plants.length + ' plants · ' + data.meta.units + ' units · ' +
        data.meta.countries + ' countries';
      buildFilters();
      refresh();
    })
    .catch(function (err) {
      document.getElementById('subtitle').textContent = 'Failed to load plant data.';
      console.error(err);
    });
})();
