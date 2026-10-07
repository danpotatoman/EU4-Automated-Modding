export const canonical = nodes => nodes.map(({ key, op, value }) => ({ key, op,
  value: Array.isArray(value) ? canonical(value) : value }));
export function unique(nodes, key) {
  const matches = nodes.flatMap(node => [ ...(node.key === key && Array.isArray(node.value) ? [node] : []),
    ...(Array.isArray(node.value) ? findAll(node.value, key) : []) ]);
  if (matches.length !== 1) throw Error(`Expected exactly one ${key}; found ${matches.length}.`);
  return matches[0];
}
function findAll(nodes, key) {
  return nodes.flatMap(node => [...(node.key === key && Array.isArray(node.value) ? [node] : []),
    ...(Array.isArray(node.value) ? findAll(node.value, key) : [])]);
}
