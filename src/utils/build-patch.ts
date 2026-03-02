import ansiEscapes from 'ansi-escapes';

export function buildPatch(previousCount: number, start: number, endPrevious: number, endNext: number, nextLines: string[], nextWrappedEndsWithNewline: boolean): string {
	let sequence = '';

	// Move cursor up to the first changed line, starting from the trailing blank line.
	const upCount = Math.max(0, previousCount - 1 - start);
	if(upCount > 0) {
		sequence += ansiEscapes.cursorUp(upCount);
	}

	sequence += ansiEscapes.cursorLeft;

	// Clear the changed block from the previous frame.
	const linesToClear = Math.max(0, endPrevious - start + 1);
	for(let index = 0; index < linesToClear; index++) {
		sequence += ansiEscapes.eraseLine;

		if(index < linesToClear - 1) {
			sequence += ansiEscapes.cursorDown();
		}
	}

	if(linesToClear > 1) {
		sequence += ansiEscapes.cursorUp(linesToClear - 1);
	}

	sequence += ansiEscapes.cursorLeft;

	// Write the new changed block.
	const wroteSlice = nextLines.slice(start, endNext + 1);
	if(wroteSlice.length > 0) {
		const chunk = wroteSlice.join('\n');
		sequence += chunk;

		// Ensure we do not leave trailing characters on the last written line
		sequence += ansiEscapes.eraseEndLine;

		if(nextWrappedEndsWithNewline && !chunk.endsWith('\n')) {
			sequence += '\n';
		}
	}

	// Reposition cursor to the final trailing blank line for the next call
	const currentLine = start + wroteSlice.length;
	const finalLine = nextLines.length - 1;
	const downCount = finalLine - currentLine;
	if(downCount > 0) {
		sequence += ansiEscapes.cursorDown(downCount);
	}

	return sequence;
}
