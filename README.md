[@zokugun/log-update-plus](https://github.com/zokugun/node-log-update-plus)
==========================================================

[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@zokugun/log-update-plus.svg?colorB=green)](https://www.npmjs.com/package/@zokugun/log-update-plus)
[![Donation](https://img.shields.io/badge/donate-ko--fi-green)](https://ko-fi.com/daiyam)
[![Donation](https://img.shields.io/badge/donate-liberapay-green)](https://liberapay.com/daiyam/donate)
[![Donation](https://img.shields.io/badge/donate-paypal-green)](https://paypal.me/daiyam99)

> Update the terminal line in place. Ideal for progress bars, animations, and live-updating status.

Overview
--------

`@zokugun/log-update-plus` is a TypeScript-first port and fork of [`log-update`](https://github.com/sindresorhus/log-update).
The unnecessary goal is to keep the compatibility with **Node.js 18.x**.

Installation
------------

```bash
npm add @zokugun/log-update-plus
```

Usage
-----

```typescript
import c from 'ansi-colors';
import cliSpinners from 'cli-spinners';
import { stdout } from '@zokugun/log-update-plus';

type IndicatorLoading = ReturnType<typeof setInterval>;

const { dots } = cliSpinners;

let $loading: IndicatorLoading | undefined;

export function log(message: string): void {
	stdout.persist(`${c.cyan(c.symbols.bullet)} ${message}`);
}

export function progress(label: string): void {
	clearInterval($loading);

	let index = 0;

	$loading = setInterval(() => {
		stdout.render(`${c.cyan(dots.frames[index = ++index % dots.frames.length])} ${label}`);
	}, dots.interval);
}
```

Quick Reference
---------------

```typescript
type Options = {
    readonly showCursor?: boolean;
    readonly defaultWidth?: number;
    readonly defaultHeight?: number;
};

class LogUpdate {
    constructor(stream: tty.WriteStream, { showCursor, defaultWidth, defaultHeight }?: Options);
    clear(): void;
    done(): void;
    persist(...values: string[]): void;
    render(...values: string[]): void;
}

const stdout: LogUpdate;
const stderr: LogUpdate;
```

Donations
---------

Support this project by becoming a financial contributor.

<table>
    <tr>
        <td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_kofi.png" alt="Ko-fi" width="80px" height="80px"></td>
        <td><a href="https://ko-fi.com/daiyam" target="_blank">ko-fi.com/daiyam</a></td>
    </tr>
    <tr>
        <td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_liberapay.png" alt="Liberapay" width="80px" height="80px"></td>
        <td><a href="https://liberapay.com/daiyam/donate" target="_blank">liberapay.com/daiyam/donate</a></td>
    </tr>
    <tr>
        <td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_paypal.png" alt="PayPal" width="80px" height="80px"></td>
        <td><a href="https://paypal.me/daiyam99" target="_blank">paypal.me/daiyam99</a></td>
    </tr>
</table>

License
-------

Copyright &copy; 2026-present Baptiste Augrain

Licensed under the [MIT license](https://opensource.org/licenses/MIT).
