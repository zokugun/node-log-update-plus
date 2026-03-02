import type tty from 'node:tty';
import ansiEscapes from 'ansi-escapes';
import cliCursor from 'cli-cursor';
import sliceAnsi from 'slice-ansi';
import stripAnsi from 'strip-ansi';
import wrapAnsi from 'wrap-ansi';
import { type Options } from './options.js';
import { buildPatch } from './utils/build-patch.js';
import { diffFrames } from './utils/diff-frames.js';

const DEFAULT_HEIGHT = 24;
const DEFAULT_WIDTH = 80;
const SYNCHRONIZED_OUTPUT_ENABLE = '\u001B[?2026h';
const SYNCHRONIZED_OUTPUT_DISABLE = '\u001B[?2026l';

export class LogUpdate {
	private readonly _defaultHeight: number;
	private readonly _defaultWidth: number;
	private readonly _showCursor: boolean;
	private readonly _stream: tty.WriteStream;
	private readonly _useSynchronizedOutput: boolean;
	private _previousLineCount: number;
	private _previousWidth: number;
	private _previousOutput: string;

	constructor(stream: tty.WriteStream, { showCursor = false, defaultWidth, defaultHeight }: Options = {}) { // {{{
		this._stream = stream;
		this._showCursor = showCursor;
		this._defaultWidth = defaultWidth ?? DEFAULT_WIDTH;
		this._defaultHeight = defaultHeight ?? DEFAULT_HEIGHT;

		this._previousLineCount = 0;
		this._previousWidth = this.getWidth();
		this._previousOutput = '';
		this._useSynchronizedOutput = stream.isTTY;
	} // }}}

	public clear(): void { // {{{
		this.write(ansiEscapes.eraseLines(this._previousLineCount));
		this.reset();
	} // }}}

	public done(): void { // {{{
		this.reset();

		if(!this._showCursor) {
			cliCursor.show();
		}
	} // }}}

	public persist(...values: string[]): void { // {{{
		const erasePrevious = this._previousLineCount > 0 ? ansiEscapes.eraseLines(this._previousLineCount) : '';
		if(this._previousLineCount > 0) {
			this._previousLineCount = 0;
		}

		const text = `${values.join(' ')}`;
		const width = this.getWidth();
		const { wrapped: wrappedText } = this.computeFrame(text, width);

		this.write(erasePrevious + wrappedText);
		this.reset();
	} // }}}

	public render(...values: string[]): void { // {{{
		if(!this._showCursor) {
			cliCursor.hide();
		}

		const width = this.getWidth();
		const { wrapped, lines, wasClipped } = this.computeFrame(values.join(' '), width);

		if(lines.length === 0) {
			this._previousOutput = wrapped;
			this._previousWidth = width;
			this._previousLineCount = 0;
			return;
		}

		if(wrapped === this._previousOutput && this._previousWidth === width) {
			return;
		}

		if(this._previousLineCount === 0) {
			this.write(wrapped);

			this._previousOutput = wrapped;
			this._previousWidth = width;
			this._previousLineCount = lines.length;

			return;
		}

		if(this._previousWidth !== width || wasClipped) {
			this.write(ansiEscapes.eraseLines(this._previousLineCount) + wrapped);

			this._previousOutput = wrapped;
			this._previousWidth = width;
			this._previousLineCount = lines.length;

			return;
		}

		const previousLines = this._previousOutput === '' ? [] : this._previousOutput.split('\n');
		const { start, endPrevious, endNext } = diffFrames(previousLines, lines);

		if(start === lines.length && this._previousLineCount === lines.length) {
			return;
		}

		if(start === 0) {
			this.write(ansiEscapes.eraseLines(this._previousLineCount) + wrapped);

			this._previousOutput = wrapped;
			this._previousWidth = width;
			this._previousLineCount = lines.length;

			return;
		}

		const patch = buildPatch(this._previousLineCount, start, endPrevious, endNext, lines, wrapped.endsWith('\n'));

		this.write(patch);

		this._previousOutput = wrapped;
		this._previousWidth = width;
		this._previousLineCount = lines.length;
	} // }}}

	protected computeFrame(text: string, width: number): { wrapped: string; lines: string[];wasClipped: boolean } { // {{{
		const raw = text.endsWith('\n') ? text : `${text}\n`;
		const wrapped = wrapAnsi(raw, width, { trim: false, hard: true, wordWrap: false });
		const { text: clippedText, wasClipped } = this.fitToTerminalHeight(wrapped);
		const lines = clippedText === '' ? [] : clippedText.split('\n');

		return { wrapped: clippedText, lines, wasClipped };
	} // }}}

	protected fitToTerminalHeight(wrappedText: string): { text: string; wasClipped: boolean } { // {{{
		const terminalHeight = this._stream.rows ?? this._defaultHeight;
		// if (terminalHeight === undefined) {
		// 	return {text: wrappedText, wasClipped: false};
		// }

		if(terminalHeight === 0) {
			return { text: '', wasClipped: wrappedText !== '' };
		}

		const unstyled = stripAnsi(wrappedText);
		const newlineCount = [...unstyled].filter((character) => character === '\n').length;
		const linesCount = newlineCount + 1;
		const toRemove = Math.max(0, linesCount - terminalHeight);

		if(toRemove === 0) {
			return { text: wrappedText, wasClipped: false };
		}

		let seen = 0;
		let cut = 0;

		for(const [index, character] of [...unstyled].entries()) {
			if(character === '\n') {
				seen++;
				if(seen === toRemove) {
					cut = index + 1;
					break;
				}
			}
		}

		const text = sliceAnsi(wrappedText, cut);

		return { text, wasClipped: true };
	} // }}}

	protected getWidth(): number { // {{{
		return this._stream.columns ?? this._defaultWidth;
	} // }}}

	protected reset(): void { // {{{
		this._previousOutput = '';
		this._previousWidth = this.getWidth();
		this._previousLineCount = 0;
	} // }}}

	protected write(output: string): void { // {{{
		if(output === '') {
			return;
		}

		if(this._useSynchronizedOutput) {
			this._stream.write(SYNCHRONIZED_OUTPUT_ENABLE + output + SYNCHRONIZED_OUTPUT_DISABLE);
			return;
		}

		this._stream.write(output);
	} // }}}
}
