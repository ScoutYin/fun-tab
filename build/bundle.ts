import path from 'path';
import { rollup } from 'rollup';
import { srcDir, pkgDistDir } from './path';
import vue from '@vitejs/plugin-vue';
import esbuild from 'rollup-plugin-esbuild';
import css from 'rollup-plugin-css-only';
import { writeBundles, formatBundleFilename } from './utils/rollup';
import { Plugin } from 'rollup';

const build = async (minify: boolean) => {
	const bundle = await rollup({
		input: path.resolve(srcDir, 'index.ts'),
		plugins: [
			vue({
				isProduction: true,
			}),
			css({ output: 'index.css' }) as Plugin,
			esbuild({
				target: 'esnext',
				minify,
				sourceMap: minify,
				loaders: {
					'.vue': 'ts',
				},
			}),
		],
		external: ['vue'],
	});

	await writeBundles(bundle, [
		{
			format: 'esm',
			sourcemap: minify,
			file: path.resolve(pkgDistDir, formatBundleFilename('index.full', minify)),
		},
		{
			format: 'cjs',
			sourcemap: minify,
			exports: 'named', // 以命名导出方式导出
			file: path.resolve(pkgDistDir, formatBundleFilename('index.full', minify, '.cjs')),
		},
	]);
};

export const buildBundle = async () => {
	await Promise.all([build(true), build(false)]);
};
