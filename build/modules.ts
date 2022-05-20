import fastGlob from 'fast-glob';
import { rollup } from 'rollup';
import vue from '@vitejs/plugin-vue';
import esbuild from 'rollup-plugin-esbuild';
import css from 'rollup-plugin-css-only';
import { buildConfig } from './config';
import { srcDir } from './path';
import type { Plugin } from 'rollup';

export const buildModules = async () => {
	const input = await fastGlob(['**/*.{ts,vue}'], {
		cwd: srcDir,
		absolute: true,
		onlyFiles: true,
	});

	const bundle = await rollup({
		input,
		plugins: [
			vue({
				isProduction: false,
			}),
			css({
				output: 'index.css',
			}) as Plugin,
			esbuild({
				sourceMap: true, // by default inferred from rollup's `output.sourcemap` option
				// minify: false,
				target: 'esnext',
				// tsconfig: 'tsconfig.esm.json',
				loaders: {
					'.vue': 'ts',
				},
			}),
		],
		external: ['vue'],
	});

	const writers = Object.entries(buildConfig).map(([module, config]) => {
		return bundle.write({
			format: config.format,
			dir: config.output.dir,
			exports: module === 'cjs' ? 'named' : undefined,
			sourcemap: true,
			preserveModules: true,
			entryFileNames: `[name].${config.ext}`,
		});
	});
	await Promise.all(writers);
};
