import { describe, expect, it } from "vitest";
import { isWithinHours, makeSlots, overlaps } from "./booking-domain";

const open = { openingTime: "09:00", closingTime: "23:00", isClosed: false };
describe("slots", () => {
  it("only generates slots that finish before closing", () => expect(makeSlots(open, 90)).toEqual(["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30", "21:00"]));
  it("does not allow a multi-slot booking to exceed closing", () => expect(isWithinHours("21:00", 2, 90, open)).toBe(false));
  it("honours a closed special day", () => expect(makeSlots({ openingTime: null, closingTime: null, isClosed: true }, 90)).toEqual([]));
});
describe("overlap", () => {
  it("allows adjacent bookings", () => expect(overlaps(new Date("2026-08-18T18:00:00Z"), new Date("2026-08-18T19:30:00Z"), new Date("2026-08-18T19:30:00Z"), new Date("2026-08-18T21:00:00Z"))).toBe(false));
  it("rejects intersecting bookings", () => expect(overlaps(new Date("2026-08-18T18:00:00Z"), new Date("2026-08-18T19:30:00Z"), new Date("2026-08-18T19:00:00Z"), new Date("2026-08-18T20:30:00Z"))).toBe(true));
});
