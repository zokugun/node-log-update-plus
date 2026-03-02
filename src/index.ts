import process from 'node:process';
import { LogUpdate } from './log-update.js';
import type { Options } from './options.js';

const stdout = new LogUpdate(process.stdout);
const stderr = new LogUpdate(process.stderr);

/* eslint-disable unicorn/prefer-export-from */
export {
	type Options,
	LogUpdate,
	stderr,
	stdout,
};
/* eslint-enable unicorn/prefer-export-from */
