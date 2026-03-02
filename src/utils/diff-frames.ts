export function diffFrames(previousLines: string[], nextLines: string[]): { start: number; endPrevious: number; endNext: number } {
	let start = 0;
	for(; start < previousLines.length && start < nextLines.length; start++) {
		if(previousLines[start] !== nextLines[start]) {
			break;
		}
	}

	let endPrevious = previousLines.length - 1;
	let endNext = nextLines.length - 1;
	while(endPrevious >= start && endNext >= start && previousLines[endPrevious] === nextLines[endNext]) {
		endPrevious--;
		endNext--;
	}

	return { start, endPrevious, endNext };
}
