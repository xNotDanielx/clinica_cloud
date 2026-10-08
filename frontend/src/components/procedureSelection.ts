export function toggleSelection(selected: string[], name: string) {
  if (selected.includes(name)) return { selected: selected.filter(item => item !== name), pending: null };
  if (selected.length >= 2) return { selected, pending: name };
  return { selected: [...selected, name], pending: null };
}

export function replaceSelection(selected: string[], previous: string, next: string) {
  if (!selected.includes(previous) || selected.includes(next)) return selected;
  return selected.map(item => item === previous ? next : item);
}
