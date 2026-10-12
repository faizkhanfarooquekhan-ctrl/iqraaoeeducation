export function levelFromXp(xp: number) {
  return Math.floor(Math.max(0, xp) / 100) + 1;
}

export function xpIntoLevel(xp: number) {
  return Math.max(0, xp) % 100;
}

export function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function yesterdayKey(date = new Date()) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - 1);
  return todayKey(copy);
}

export function nextStreak(current: number, lastActiveDate: string | null, date = new Date()) {
  const today = todayKey(date);
  if (lastActiveDate === today) return Math.max(current, 1);
  if (lastActiveDate === yesterdayKey(date)) return current + 1;
  return 1;
}

export function practiceXp(correct: boolean, combo: number) {
  if (!correct) return 0;
  return combo >= 3 ? 25 : 10;
}

export function testXp(correct: number) {
  return correct * 20;
}
