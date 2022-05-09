interface IndexableWindow {
	/* eslint-disable @typescript-eslint/no-explicit-any */
	[key: string]: any;
}
const win = window as IndexableWindow;

export function windowInit() {
	let lastTime = 0;
	const vendors = ['webkit', 'moz'];
	for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = win[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame =
			win[vendors[x] + 'CancelAnimationFrame'] || // name has changed in Webkit
			win[vendors[x] + 'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function (callback) {
			const currTime = Date.now();
			// 刷新间隔16.7ms（每秒60次刷新）
			const interval = currTime - lastTime;
			const timeToCall = Math.max(0, 16.7 - interval);
			const id = window.setTimeout(function () {
				callback(interval);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}
	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function (id) {
			clearTimeout(id);
		};
	}
}
