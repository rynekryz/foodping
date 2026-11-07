export function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

export function isValidDate(dateStr) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(dateStr);
  if (!match) return false;
  const [d, m, y] = match.slice(1).map(Number);
  const year = y + (y < 100 ? 2000 : 0);
  const date = new Date(year, m - 1, d);
  return date.getFullYear() === year && date.getMonth() === m - 1 && date.getDate() === d;
}

export function parseDate(dateStr) {
  const [d, m, y] = dateStr.split('/');
  return new Date(parseInt(y) + (parseInt(y) < 100 ? 2000 : 0), parseInt(m) - 1, parseInt(d));
}

export function getFoods() {
  const foods = readJson('foods', []);
  if (!Array.isArray(foods)) return [];
  return foods.filter(f => f && typeof f.name === 'string' && typeof f.date === 'string' && isValidDate(f.date));
}

export function saveFoods(foods) {
  localStorage.setItem('foods', JSON.stringify(foods));
  window.dispatchEvent(new Event('foods:changed'));
}
