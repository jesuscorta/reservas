import { addDays, format, parseISO } from "date-fns";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";

export const localDate = (date: Date, timezone: string) => formatInTimeZone(date, timezone, "yyyy-MM-dd");
export const localTime = (date: Date, timezone: string) => formatInTimeZone(date, timezone, "HH:mm");
export const dayOfWeek = (date: string) => parseISO(date).getDay();
export const nextDate = (date: string) => format(addDays(parseISO(date), 1), "yyyy-MM-dd");
export const toInstant = (date: string, time: string, timezone: string) => fromZonedTime(`${date}T${time}`, timezone);
