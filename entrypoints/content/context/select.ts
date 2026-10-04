import type { TextContext } from "~/utils/types";

export const extractContextFromSelection = (
	selection: Selection,
): TextContext | null => {
	if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
		return null;
	const range = selection.getRangeAt(0);
	const selectedText = range.toString();
	if (!selectedText.trim()) return null;
	let container: Node = range.commonAncestorContainer;
	if (container.nodeType === Node.TEXT_NODE) container = container.parentNode ?? container;
	// Inline markup splits a sentence across nodes. Read its nearest prose block.
	while (
		container.parentNode &&
		container instanceof Element &&
		!container.matches("p, li, blockquote, h1, h2, h3, h4, td, article, div")
	) {
		container = container.parentNode;
	}
	const before = document.createRange();
	before.selectNodeContents(container);
	before.setEnd(range.startContainer, range.startOffset);
	const after = document.createRange();
	after.selectNodeContents(container);
	after.setStart(range.endContainer, range.endOffset);
	return {
		text: selectedText,
		surr: {
			before: before.toString().slice(-4000),
			after: after.toString().slice(0, 4000),
		},
	};
};
