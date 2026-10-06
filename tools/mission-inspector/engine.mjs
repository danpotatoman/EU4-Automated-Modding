export function parse(text, file = 'script') {
  text = text.replace(/^\uFEFF/, '');
  const tokens = []; let i = 0, line = 1;
  while (i < text.length) {
    const c = text[i];
    if (/\s/.test(c)) { if (c === '\n') line++; i++; continue; }
    if (c === '#') { while (i < text.length && text[i] !== '\n') i++; continue; }
    const start = i, at = line;
    if (c === '"') {
      i++; let value = '', closed = false;
      while (i < text.length) {
        if (text[i] === '"') { i++; closed = true; break; }
        if (text[i] === '\\' && i + 1 < text.length) { value += text[i] + text[i + 1]; i += 2; }
        else { if (text[i] === '\n') line++; value += text[i++]; }
      }
      if (!closed) throw Error(`${file}:${at}: Unterminated string`);
      tokens.push({ value, start, end: i, line: at, quoted: true }); continue;
    }
    if ('{}=<>!'.includes(c)) {
      i++; if ('<>!='.includes(c) && text[i] === '=') i++;
      tokens.push({ value: text.slice(start, i), start, end: i, line: at }); continue;
    }
    while (i < text.length && !/[\s#{}=<>!\"]/.test(text[i])) i++;
    tokens.push({ value: text.slice(start, i), start, end: i, line: at });
  }
  let cursor = 0;
  function block(nested) {
    const nodes = [];
    while (cursor < tokens.length) {
      const key = tokens[cursor++];
      if (key.value === '}' && !key.quoted) { if (!nested) throw Error(`${file}:${key.line}: Unexpected }`); return nodes; }
      if (key.value === '{' && !key.quoted) throw Error(`${file}:${key.line}: Unexpected {`);
      const node = { key: key.value, line: key.line, start: key.start, end: key.end, value: null, op: null };
      const next = tokens[cursor];
      if (next && ['=', '<', '>', '<=', '>=', '!=', '=='].includes(next.value) && !next.quoted) {
        node.op = next.value; cursor++;
        const value = tokens[cursor++];
        if (!value || value.value === '}' && !value.quoted) throw Error(`${file}:${key.line}: Missing value`);
        if (value.value === '{' && !value.quoted) { node.value = block(true); node.end = tokens[cursor - 1].end; }
        else { node.value = value.value; node.end = value.end; }
      }
      nodes.push(node);
    }
    if (nested) throw Error(`${file}: Unclosed block`);
    return nodes;
  }
  return block(false);
}
export function field(nodes, key) { return nodes.find(node => node.key === key); }
export function extract(text, file, titles = {}) {
  const series = [], diagnostics = [];
  const nodes = parse(text, file);
  const variables = Object.fromEntries(nodes.filter(node => node.key.startsWith('@')).map(node => [node.key, node.value]));
  const number = value => Number(variables[value] ?? value);
  const metadata = new Set(['slot', 'generic', 'ai', 'potential', 'potential_on_load', 'has_country_shield']);
  for (const node of nodes) {
    if (!Array.isArray(node.value) || node.key.startsWith('@')) continue;
    const slot = field(node.value, 'slot');
    const group = { id: node.key, file, line: node.line, slot: slot ? number(slot.value) : null, generic: field(node.value, 'generic')?.value === 'yes', potential: field(node.value, 'potential')?.value || [], potentialOnLoad: field(node.value, 'potential_on_load')?.value || [], missions: [] };
    let previous = 0;
    for (const mission of node.value) {
      if (metadata.has(mission.key) || !Array.isArray(mission.value)) continue;
      const explicit = field(mission.value, 'position');
      const row = explicit ? number(explicit.value) : previous + 1;
      previous = row;
      const requirements = field(mission.value, 'required_missions');
      const raw = key => { const entry = field(mission.value, key); return entry ? text.slice(entry.start, entry.end) : ''; };
      group.missions.push({ id: mission.key, series: group.id, file, line: mission.line, slot: group.slot, row, inferredPosition: !explicit, title: titles[`${mission.key}_title`] || mission.key, missingTitle: !titles[`${mission.key}_title`], missingDescription: !titles[`${mission.key}_desc`], icon: field(mission.value, 'icon')?.value || '', required: Array.isArray(requirements?.value) ? requirements.value.map(entry => entry.key) : [], trigger: raw('trigger'), effect: raw('effect') });
    }
    series.push(group);
  }
  return { series, diagnostics };
}
// Only these simple country predicates are evaluated. Everything else is unknown.
export function potential(nodes, state) {
  if (!Array.isArray(nodes)) return null;
  const and = values => values.includes(false) ? false : values.includes(null) ? null : true;
  const or = values => values.includes(true) ? true : values.includes(null) ? null : false;
  function evaluate(node) {
    if (node.op !== '=') return null;
    if (node.key === 'NOT') { if (!Array.isArray(node.value)) return null; const result = and(node.value.map(evaluate)); return result === null ? null : !result; }
    if (node.key === 'OR') return Array.isArray(node.value) ? or(node.value.map(evaluate)) : null;
    if (node.key === 'AND') return Array.isArray(node.value) ? and(node.value.map(evaluate)) : null;
    if (node.key === 'always') return node.value === 'yes' ? true : node.value === 'no' ? false : null;
    if (node.key === 'tag') return state.tag ? state.tag === node.value : null;
    if (node.key === 'map_setup') return state.mapSetup ? state.mapSetup === node.value : null;
    if (node.key === 'has_country_flag') return Array.isArray(state.flags) ? state.flags.includes(node.value) : null;
    return null;
  }
  return and(nodes.map(evaluate));
}
export function analyze(data, scenario = {}, selectedIds = null) {
  const findings = [...(data.diagnostics || [])];
  const add = (severity, code, message, missions = [], extra = {}) => findings.push({ severity, code, message, missions, ...extra });
  for (const flags of data.mutuallyExclusiveFlags || []) {
    const present = flags.filter(flag => scenario.flags?.includes(flag));
    if (present.length > 1) add('error', 'conflicting-state', `Scenario has mutually exclusive flags: ${present.join(', ')}. Alternative mission branches may disappear.`, []);
  }
  const groups = data.series.map(group => ({ ...group, visibility: potential(group.potential, scenario), loadVisibility: potential(group.potentialOnLoad, scenario) }));
  const seriesCounts = new Map();
  for (const group of groups) seriesCounts.set(group.id, (seriesCounts.get(group.id) || 0) + 1);
  for (const [id, count] of seriesCounts) if (count > 1) add('error', 'duplicate-series', `Series ID ${id} is defined ${count} times; preview selection is ambiguous.`, groups.filter(group => group.id === id).flatMap(group => group.missions.map(mission => mission.id)));
  const selected = groups.filter(group => selectedIds ? selectedIds.includes(group.id) : group.visibility !== false && group.loadVisibility !== false);
  const missions = selected.flatMap(group => group.missions.map(mission => ({ ...mission, uncertainVisibility: group.visibility === null || group.loadVisibility === null })));
  const global = new Map();
  for (const mission of data.series.flatMap(group => group.missions)) {
    if (!global.has(mission.id)) global.set(mission.id, []);
    global.get(mission.id).push(mission);
  }
  for (const [id, entries] of global) if (entries.length > 1) add('error', 'duplicate-id', `Mission ID ${id} is defined ${entries.length} times.`, [id]);
  for (const group of selected) {
    if (group.visibility === null || group.loadVisibility === null) add('warning', 'unknown-potential', `${group.id}: visibility includes unsupported conditions; check this series selection manually.`, group.missions.map(mission => mission.id));
    if (!Number.isInteger(group.slot) || group.slot < 1) add('error', 'invalid-slot', `${group.id}: slot must be a positive integer.`, group.missions.map(mission => mission.id));
    if (group.generic) add('warning', 'generic-priority', `${group.id}: generic replacement priority is not simulated.`, group.missions.map(mission => mission.id));
  }
  const map = new Map(missions.map(mission => [mission.id, mission]));
  const cells = new Map();
  for (const mission of missions) {
    if (!Number.isInteger(mission.row) || mission.row < 1) add('error', 'invalid-position', `${mission.id}: position must be a positive integer.`, [mission.id]);
    if (mission.inferredPosition) add('info', 'implicit-position', `${mission.id}: row ${mission.row} inferred from series order; verify in game.`, [mission.id]);
    if (mission.missingTitle || mission.missingDescription) add('warning', 'missing-localisation', `${mission.id}: missing English ${[mission.missingTitle && 'title', mission.missingDescription && 'description'].filter(Boolean).join(' and ')}.`, [mission.id]);
    if (!mission.icon) add('warning', 'missing-icon', `${mission.id}: no icon specified.`, [mission.id]);
    else if (data.iconIndexAvailable && !(data.icons || []).includes(mission.icon)) add('warning', 'unresolved-icon', `${mission.id}: icon ${mission.icon} was not found in loose interface definitions; check DLC assets and spelling.`, [mission.id]);
    const cell = `${mission.slot}:${mission.row}`;
    if (!cells.has(cell)) cells.set(cell, []);
    cells.get(cell).push(mission);
  }
  for (const [cell, occupants] of cells) if (occupants.length > 1) add(occupants.some(mission => mission.uncertainVisibility) ? 'warning' : 'error', 'overlap', `Cell ${cell} contains ${occupants.length} selected missions: ${occupants.map(mission => mission.id).join(', ')}.`, occupants.map(mission => mission.id));
  const edges = [];
  for (const mission of missions) {
    for (const parentId of new Set(mission.required)) {
      const parent = map.get(parentId);
      if (!parent) {
        const external = (data.externalMissions || []).includes(parentId);
        add(external ? 'warning' : 'error', external ? 'external-prerequisite' : global.has(parentId) ? 'hidden-prerequisite' : 'missing-prerequisite', `${mission.id} requires ${parentId}, which is ${external ? 'defined in vanilla but not laid out in this preview' : global.has(parentId) ? 'in an unselected series' : 'not defined in the mod or indexed vanilla files'}.`, [mission.id, parentId]);
        continue;
      }
      edges.push({ from: parentId, to: mission.id, a: { x: parent.slot, y: parent.row }, b: { x: mission.slot, y: mission.row } });
      if (parent.row >= mission.row) add('warning', 'backward-edge', `${parentId} → ${mission.id} runs ${parent.row === mission.row ? 'sideways on the same row' : 'upward'}; inspect arrow readability.`, [parentId, mission.id]);
      if (parent.slot !== mission.slot && mission.row - parent.row > 1) add('warning', 'long-diagonal', `${parentId} → ${mission.id} changes columns and skips rows (${parent.slot}, ${parent.row}) → (${mission.slot}, ${mission.row}). Cross-column connections should reach the immediately following row for a clean layout.`, [parentId, mission.id]);
      if (mission.required.filter(id => id === parentId).length > 1) add('warning', 'duplicate-prerequisite', `${mission.id} repeats prerequisite ${parentId}.`, [mission.id]);
    }
  }
  // Find strongly connected components, including self-dependencies.
  let next = 0; const index = new Map(), low = new Map(), stack = [], active = new Set();
  function visit(id) {
    index.set(id, next); low.set(id, next++); stack.push(id); active.add(id);
    for (const parent of map.get(id).required.filter(parent => map.has(parent))) {
      if (!index.has(parent)) { visit(parent); low.set(id, Math.min(low.get(id), low.get(parent))); }
      else if (active.has(parent)) low.set(id, Math.min(low.get(id), index.get(parent)));
    }
    if (low.get(id) === index.get(id)) {
      const component = []; let member;
      do { member = stack.pop(); active.delete(member); component.push(member); } while (member !== id);
      if (component.length > 1 || map.get(id).required.includes(id)) add('error', 'cycle', `Dependency cycle blocks completion: ${component.join(', ')}.`, component);
    }
  }
  for (const id of map.keys()) if (!index.has(id)) visit(id);
  const blocked = new Set(findings.filter(finding => ['cycle', 'missing-prerequisite', 'hidden-prerequisite'].includes(finding.code)).flatMap(finding => finding.missions.filter(id => map.has(id))));
  let changed = true;
  while (changed) { changed = false; for (const mission of missions) if (!blocked.has(mission.id) && mission.required.some(id => blocked.has(id))) { blocked.add(mission.id); changed = true; add('error', 'blocked-descendant', `${mission.id} depends on a structurally blocked mission.`, [mission.id]); } }
  const cross = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    for (const mission of missions) {
      if ([edge.from, edge.to].includes(mission.id)) continue;
      let start = 0, end = 1;
      for (const [axis, center, half] of [['x', mission.slot, 0.39], ['y', mission.row, 0.3]]) {
        const distance = edge.b[axis] - edge.a[axis];
        if (distance === 0) { if (Math.abs(edge.a[axis] - center) > half) end = -1; }
        else { const a = (center - half - edge.a[axis]) / distance, b = (center + half - edge.a[axis]) / distance; start = Math.max(start, Math.min(a, b)); end = Math.min(end, Math.max(a, b)); }
      }
      if (start < end && end > 0 && start < 1) add('warning', 'arrow-through-card', `${edge.from} → ${edge.to} passes through or near ${mission.id}. Routing is approximate.`, [edge.from, edge.to, mission.id]);
    }
    for (let j = i + 1; j < edges.length; j++) {
      const other = edges[j];
      if ([edge.from, edge.to].some(id => [other.from, other.to].includes(id))) continue;
      if (cross(edge.a, edge.b, other.a) * cross(edge.a, edge.b, other.b) < 0 && cross(other.a, other.b, edge.a) * cross(other.a, other.b, edge.b) < 0) add('warning', 'crossing-arrows', `${edge.from} → ${edge.to} crosses ${other.from} → ${other.to} in the schematic.`, [edge.from, edge.to, other.from, other.to]);
    }
  }
  for (const mission of missions) {
    if (mission.slot > 8 || mission.row > 50) add('warning', 'large-layout', `${mission.id}: unusually large grid coordinate (${mission.slot}, ${mission.row}); check viewport usability.`, [mission.id]);
  }
  return { groups, selected: selected.map(group => group.id), missions, edges, findings, summary: Object.fromEntries(['error', 'warning', 'info'].map(severity => [severity, findings.filter(finding => finding.severity === severity).length])) };
}
