export type Hours = { openingTime: string | null; closingTime: string | null; isClosed: boolean };

export function makeSlots(hours: Hours, durationMinutes: number): string[] {
  if (hours.isClosed || !hours.openingTime || !hours.closingTime || durationMinutes < 1) return [];
  const toMinutes = (value: string) => {
    const [hour, minute] = value.slice(0, 5).split(":").map(Number);
    return hour * 60 + minute;
  };
  const format = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  const opening = toMinutes(hours.openingTime);
  const closing = toMinutes(hours.closingTime);
  const slots: string[] = [];
  for (let start = opening; start + durationMinutes <= closing; start += durationMinutes) slots.push(format(start));
  return slots;
}

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

export function isWithinHours(start: string, durationSlots: number, durationMinutes: number, hours: Hours) {
  const slots = makeSlots(hours, durationMinutes);
  const startIndex = slots.indexOf(start);
  return startIndex >= 0 && startIndex + durationSlots <= slots.length;
}
