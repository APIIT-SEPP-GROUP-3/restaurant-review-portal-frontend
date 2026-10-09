import { describe, expect, it } from "vitest";
import { formatRating } from "@/lib/format-rating";

describe("formatRating", () => {
  it.each([
    [4.76, "4.8/5"],
    ["3.5", "3.5/5"],
    [0, "0.0/5"],
    [null, "Not rated"],
    ["invalid", "Not rated"],
    [Infinity, "Not rated"],
  ])("formats %s as %s", (value, expected) => {
    expect(formatRating(value)).toBe(expected);
  });
});
