import { spawn } from 'child_process';
import { projectRoot } from '../path';

export const run = (command: string, cwd: string = projectRoot) => {
	return new Promise<void>((resolve, reject) => {
		const [cmd, ...args] = command.split(' ');

		const app = spawn(cmd, args, {
			cwd,
			stdio: 'inherit',
		});

		const onProcessExit = () => app.kill('SIGHUP');

		app.on('close', (code) => {
			process.removeListener('exit', onProcessExit);

			if (code === 0) {
				resolve();
			} else {
				reject(
					new Error(`Command failed. \n Command: ${command} \n Code: ${code}`)
				);
			}
		});

		// 主进程退出时，子进程也 kill 掉
		process.on('exit', onProcessExit);
	});
};
