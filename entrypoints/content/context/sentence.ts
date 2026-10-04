import type { TextContext } from "~/utils/types";

/** Narrow paragraph context to the sentence(s) containing the exact selection. */
export function sentenceContext(context: TextContext): TextContext {
	const before = context.surr?.before ?? "";
	const after = context.surr?.after ?? "";
	const full = before + context.text + after;
	const start = before.length;
	const end = start + context.text.length;
	const segments = [
		...new Intl.Segmenter("en", { granularity: "sentence" }).segment(full),
	];
	const first = segments.find(
		(part) => part.index + part.segment.length > start,
	);
	const last = segments.find(
		(part) => part.index < end && part.index + part.segment.length >= end,
	);
	return {
		text: context.text,
		surr: {
			before: full.slice(first?.index ?? start, start),
			after: full.slice(end, last ? last.index + last.segment.length : end),
		},
	};
}
