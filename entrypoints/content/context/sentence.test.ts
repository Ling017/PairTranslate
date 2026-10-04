import { describe, expect, test } from "bun:test";
import { sentenceContext } from "./sentence";

describe("selected expression keeps its sentence", () => {
	test("excludes adjacent sentences while preserving selection", () => {
		expect(
			sentenceContext({
				text: "genuinely",
				surr: {
					before: "Earlier sentence. What he offers is ",
					after: " high ticket. Next sentence.",
				},
			}),
		).toEqual({
			text: "genuinely",
			surr: { before: "What he offers is ", after: " high ticket. " },
		});
	});
	test("keeps selections spanning sentences", () => {
		expect(
			sentenceContext({
				text: "one. Second",
				surr: { before: "First ", after: " sentence. Third." },
			}),
		).toEqual({
			text: "one. Second",
			surr: { before: "First ", after: " sentence. " },
		});
	});
	test("does not break decimal prices", () => {
		expect(
			sentenceContext({
				text: "$1.5",
				surr: { before: "It costs ", after: " today. Goodbye." },
			}).surr?.after,
		).toBe(" today. ");
	});
});
