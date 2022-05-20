import { series, parallel } from 'gulp';
import { copy } from 'fs-extra';
import { buildModules } from './modules';
import { generateTypesDefinitions } from './types-definitions';
import { buildBundle } from './bundle';
import { run } from './utils/process';
import { buildConfig } from './config';
import { typesDir } from './path';

const clean = () => run('rimraf dist');

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
		buildBundle,
		series(parallel(buildModules, generateTypesDefinitions), copyTypesDefinitions)
	)
);
