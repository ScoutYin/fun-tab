import path from 'path';
import { series, parallel } from 'gulp';
import { copy } from 'fs-extra';
import { buildModules } from './modules';
import { generateTypesDefinitions } from './types-definitions';
import { buildBundle } from './bundle';
import { run } from './utils/process';
import { buildConfig } from './config';
import { typesDir, projectRoot, pkgDir } from './path';

const clean = () => run('rimraf dist');

const copyFiles = async () => {
	copy(
		path.resolve(projectRoot, 'package.json'),
		path.resolve(pkgDir, 'package.json')
	);
	copy(
		path.resolve(projectRoot, 'README.md'),
		path.resolve(pkgDir, 'README.md')
	);
};

const copyTypesDefinitions = async () => {
	return Promise.all(
		Object.values(buildConfig).map((moduleConfig) => {
			return copy(typesDir, moduleConfig.output.dir, { recursive: true });
		})
	);
};

export default series(
	clean,
	parallel(
		copyFiles,
		buildBundle,
		series(
			parallel(buildModules, generateTypesDefinitions),
			copyTypesDefinitions
		)
	)
);
