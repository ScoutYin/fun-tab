import type { OutputOptions, RollupBuild } from 'rollup';

export const writeBundles = (bundle: RollupBuild, modules: OutputOptions[]) => {
	return Promise.all(
		modules.map((module) => {
			return bundle.write(module);
		})
	);
};

export const formatBundleFilename = (name: string, minify: boolean, extname = '.js') => {
	return `${name}${minify ? '.min' : ''}${extname}`;
};
