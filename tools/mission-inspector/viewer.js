const $ = id => document.getElementById(id);
const ns = 'http://www.w3.org/2000/svg';
function svgElement(tag, attrs = {}, text = '') { const element = document.createElementNS(ns, tag); for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value); if (text) element.textContent = text; return element; }
function element(tag, text, className = '') { const node = document.createElement(tag); node.textContent = text; node.className = className; return node; }
let selected = null, focused = [], current;
const cellWidth = 220, cellHeight = 126, gridLeft = 55, gridTop = 60, cardWidth = 172, cardHeight = 74;
const point = mission => ({ x: gridLeft + (mission.slot - 0.5) * cellWidth, y: gridTop + (mission.row - 0.5) * cellHeight });
$('subtitle').textContent = `${DATA.mod} · ${DATA.series.length} series · generated ${new Date(DATA.generatedAtUtc).toLocaleString()}`;
$('referenceLimits').textContent = DATA.referenceLimitations.length ? DATA.referenceLimitations.join('\n') : 'Loose vanilla mission and sprite definitions are indexed when available; DLC archives are not scanned.';
DATA.scenarios.forEach((scenario, index) => { const option = element('option', scenario.name); option.value = index; $('scenario').append(option); });
function focus(ids) { focused = ids; render(); const node = [...$('tree').querySelectorAll('.node')].find(node => ids.includes(node.dataset.id)); if (node) node.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
function details(mission) {
  const panel = $('details'); panel.replaceChildren();
  if (!mission) { panel.append(element('p', 'Select a mission or a finding to inspect its source and dependencies.')); return; }
  if (focused.length > 1) {
    panel.append(element('p', 'Affected missions:'));
    for (const id of focused) { const button = element('button', id, 'overflow'); button.onclick = () => focus([id]); panel.append(button); }
  }
  panel.append(element('strong', mission.title), element('p', mission.id), element('p', `${mission.file}:${mission.line}`), element('p', `Slot ${mission.slot}, row ${mission.row}${mission.inferredPosition ? ' (inferred)' : ''} · icon: ${mission.icon || 'missing'}`), element('p', `Series: ${mission.series}`), element('p', `Requires: ${mission.required.join(', ') || 'none'}`));
  const group = DATA.series.find(group => group.id === mission.series);
  for (const [label, content] of [['Series visibility', JSON.stringify({ potential: group.potential, potential_on_load: group.potentialOnLoad }, null, 2)], ['Completion conditions', mission.trigger], ['Rewards', mission.effect]]) {
    const section = document.createElement('details'); section.append(element('summary', label), element('pre', content || '(not specified)')); panel.append(section);
  }
}
function lines(text, max = 24) {
  const words = text.split(/\s+/).flatMap(word => word.length > max ? word.match(new RegExp(`.{1,${max}}`, 'g')) : [word]), result = []; let line = '';
  for (const word of words) { if ((line + ' ' + word).trim().length > max && line) { result.push(line); line = ''; } line += (line ? ' ' : '') + word; }
  if (line) result.push(line); return result;
}
function render() {
  const scenario = DATA.scenarios[Number($('scenario').value)];
  current = analyze(DATA, scenario, selected);
  $('selectionNote').textContent = selected === null ? 'Scenario predicates select series automatically; unknown predicates remain visible.' : 'Manual selection: checked series are forced into this schematic, including series the scenario would hide.';
  $('series').replaceChildren();
  for (const group of current.groups) {
    const label = element('label', '', 'series'); const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = current.selected.includes(group.id);
    checkbox.addEventListener('change', () => { selected = [...current.selected]; if (checkbox.checked) selected.push(group.id); else selected = selected.filter(id => id !== group.id); focused = []; render(); });
    label.append(checkbox, document.createTextNode(' ' + group.id), element('small', `Slot ${group.slot} · ${group.missions.length} missions · ${group.visibility === false || group.loadVisibility === false ? 'hidden in scenario' : group.visibility === null || group.loadVisibility === null ? 'visibility uncertain' : 'eligible'}`)); $('series').append(label);
  }
  $('summary').replaceChildren(element('strong', `${current.missions.length} missions`), element('span', `${current.summary.error} errors`, 'error'), element('span', `${current.summary.warning} warnings`, 'warning'), element('span', `${current.summary.info} notes`, 'info'));
  const usable = current.missions.filter(mission => Number.isInteger(mission.slot) && mission.slot > 0 && mission.slot <= 12 && Number.isInteger(mission.row) && mission.row > 0 && mission.row <= 80);
  const columns = Math.max(5, ...usable.map(mission => mission.slot)), rows = Math.max(1, ...usable.map(mission => mission.row));
  const width = gridLeft + columns * cellWidth + 20, height = gridTop + rows * cellHeight + 20;
  const scale = Number($('zoom').value) / 100;
  $('zoomValue').textContent = `${$('zoom').value}%`;
  const tree = $('tree'); tree.replaceChildren(); tree.setAttribute('viewBox', `0 0 ${width} ${height}`); tree.setAttribute('width', width * scale); tree.setAttribute('height', height * scale);
  const defs = svgElement('defs'); const marker = svgElement('marker', { id: 'arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }); marker.append(svgElement('path', { d: 'M0 0 L10 5 L0 10 Z', fill: 'context-stroke' })); defs.append(marker); tree.append(defs);
  for (let col = 1; col <= columns; col++) tree.append(svgElement('text', { x: gridLeft + (col - 0.5) * cellWidth, y: 30, 'text-anchor': 'middle', class: 'label' }, `Slot ${col}`));
  for (let row = 1; row <= rows; row++) { const y = gridTop + (row - 0.5) * cellHeight; tree.append(svgElement('text', { x: 25, y: y + 5, 'text-anchor': 'middle', class: 'label' }, String(row))); tree.append(svgElement('line', { x1: gridLeft, x2: width - 10, y1: y, y2: y, class: 'grid' })); }
  const map = new Map(usable.map(mission => [mission.id, mission]));
  for (const edge of current.edges) {
    if (!map.has(edge.from) || !map.has(edge.to)) continue;
    const a = point(map.get(edge.from)), b = point(map.get(edge.to)); const dx = b.x - a.x, dy = b.y - a.y;
    if (!dx && !dy) continue;
    const offset = Math.min(dx ? (cardWidth / 2 + 3) / Math.abs(dx) : Infinity, dy ? (cardHeight / 2 + 3) / Math.abs(dy) : Infinity, 0.45);
    const warning = current.findings.some(finding => ['backward-edge', 'long-diagonal', 'arrow-through-card', 'crossing-arrows'].includes(finding.code) && finding.missions.includes(edge.from) && finding.missions.includes(edge.to));
    const line = svgElement('line', { x1: a.x + dx * offset, y1: a.y + dy * offset, x2: b.x - dx * offset, y2: b.y - dy * offset, class: `edge${warning ? ' problem' : ''}${focused.includes(edge.from) && focused.includes(edge.to) ? ' focus' : ''}`, 'marker-end': 'url(#arrow)' }); line.append(svgElement('title', {}, `${edge.from} → ${edge.to}`)); tree.append(line);
  }
  const occupants = new Map(); for (const mission of usable) { const key = `${mission.slot}:${mission.row}`; if (!occupants.has(key)) occupants.set(key, []); occupants.get(key).push(mission.id); }
  const search = $('search').value.toLowerCase();
  for (const mission of usable) {
    const at = point(mission), cell = occupants.get(`${mission.slot}:${mission.row}`), index = cell.indexOf(mission.id);
    const related = current.findings.filter(finding => finding.missions.includes(mission.id));
    const severity = related.some(finding => finding.severity === 'error') ? 'error' : related.some(finding => finding.severity === 'warning') ? 'warning' : '';
    const group = svgElement('g', { transform: `translate(${at.x + index * 12}, ${at.y + index * 14})`, class: `node ${severity}${focused.includes(mission.id) ? ' focus' : ''}${search && (mission.id + ' ' + mission.title).toLowerCase().includes(search) ? ' search' : ''}`, tabindex: 0, role: 'button', 'aria-label': `${mission.title}, slot ${mission.slot}, row ${mission.row}`, 'data-id': mission.id });
    group.append(svgElement('title', {}, `${mission.title}\n${mission.id}\n${mission.file}:${mission.line}`), svgElement('rect', { x: -cardWidth / 2, y: -cardHeight / 2, width: cardWidth, height: cardHeight, rx: 7, class: 'card' }));
    const titleLines = lines(mission.title); titleLines.slice(0, 2).forEach((text, index) => group.append(svgElement('text', { x: 0, y: -12 + index * 16, 'text-anchor': 'middle' }, text + (index === 1 && titleLines.length > 2 ? '…' : ''))));
    group.append(svgElement('text', { x: 0, y: 25, 'text-anchor': 'middle', class: 'meta' }, mission.id.length > 25 ? mission.id.slice(0, 24) + '…' : mission.id));
    if (cell.length > 1 && index === cell.length - 1) { group.append(svgElement('circle', { cx: 76, cy: -34, r: 13, class: 'badge' }), svgElement('text', { x: 76, y: -30, 'text-anchor': 'middle' }, `${cell.length}×`)); }
    const click = () => focus([mission.id]); group.addEventListener('click', click); group.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); click(); } }); tree.append(group);
  }
  $('offgrid').replaceChildren(); for (const mission of current.missions.filter(mission => !usable.includes(mission))) { const button = element('button', `Not drawn: ${mission.id} at slot ${mission.slot}, row ${mission.row}`, 'overflow error'); button.onclick = () => focus([mission.id]); $('offgrid').append(button); }
  details(current.missions.find(mission => focused.includes(mission.id)) || DATA.series.flatMap(group => group.missions).find(mission => focused.includes(mission.id)));
  $('findings').replaceChildren();
  const enabled = { error: $('errors').checked, warning: $('warnings').checked, info: $('infos').checked };
  const findings = current.findings.filter(finding => enabled[finding.severity]).sort((a, b) => ['error', 'warning', 'info'].indexOf(a.severity) - ['error', 'warning', 'info'].indexOf(b.severity));
  for (const finding of findings) { const button = element('button', '', 'finding'); button.append(element('strong', `${finding.severity.toUpperCase()} · ${finding.code}`, finding.severity), document.createTextNode(finding.message)); button.onclick = () => focus(finding.missions); $('findings').append(button); }
  if (!findings.length) $('findings').append(element('p', 'No findings in the selected severity filters.'));
}
$('scenario').onchange = () => { selected = null; focused = []; render(); };
$('reset').onclick = () => { selected = null; focused = []; render(); };
$('fit').onclick = () => { const viewBox = $('tree').getAttribute('viewBox').split(' ').map(Number); $('zoom').value = Math.max(40, Math.min(150, Math.floor(($('canvas').clientWidth - 4) / viewBox[2] * 100))); render(); };
$('all').onclick = () => { selected = DATA.series.map(group => group.id); focused = []; render(); };
for (const id of ['zoom', 'search', 'errors', 'warnings', 'infos']) $(id).addEventListener('input', render);
$('export').onclick = () => { const blob = new Blob([JSON.stringify({ mod: DATA.mod, generatedAtUtc: DATA.generatedAtUtc, sourceFiles: DATA.sourceFiles, scenario: DATA.scenarios[Number($('scenario').value)], manualSelection: selected !== null, ...current }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${DATA.mod}-inspection.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
render();
$('fit').click();
