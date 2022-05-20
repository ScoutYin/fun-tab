import path from 'path';
import type { ModuleFormat } from 'rollup';
import { pkgDir } from './path';

export const modules = ['es', 'cjs'] as const;

export type Module = typeof modules[number];

export interface configInfo {
	format: ModuleFormat;
	ext: 'js' | 'mjs';
	output: {
		dir: string;
	};
}

export const buildConfig: Record<Module, configInfo> = {
	es: {
		format: 'esm',
		ext: 'js',
		output: {
			dir: path.resolve(pkgDir, 'es'),
		},
	},
	cjs: {
		format: 'cjs',
		ext: 'js',
		output: {
			dir: path.resolve(pkgDir, 'lib'),
		},
	},
};
