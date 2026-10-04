import { hasMeaningfulChars } from "~/utils/blank";
import type { SelectEvent } from "./types";

export async function* selectionListener() {
	let resolve: ((event: SelectEvent) => void) | undefined;
	let timer: ReturnType<typeof setTimeout> | undefined;
	const notify = (event: MouseEvent | KeyboardEvent | TouchEvent) => {
		const target = event.target;
		if (target instanceof Element && target.closest("input, textarea, [contenteditable], [data-pt-container]")) return;
		if (timer !== undefined) clearTimeout(timer);
		timer = setTimeout(() => {
			const selection = window.getSelection();
			if (!selection?.rangeCount || !hasMeaningfulChars(selection.toString().trim())) return;
			const rect = selection.getRangeAt(0).getBoundingClientRect();
			const point = event instanceof MouseEvent ? { x: event.clientX, y: event.clientY } :
				event instanceof TouchEvent && event.changedTouches[0] ? { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY } : { x: rect.right, y: rect.bottom };
			resolve?.({ selection, position: point });
		}, 0);
	};
	document.addEventListener("mouseup", notify);
	document.addEventListener("keyup", notify);
	document.addEventListener("touchend", notify);
	try {
		while (true) yield await new Promise<SelectEvent>((done) => { resolve = done; });
	} finally {
		if (timer !== undefined) clearTimeout(timer);
		document.removeEventListener("mouseup", notify);
		document.removeEventListener("keyup", notify);
		document.removeEventListener("touchend", notify);
	}
}
