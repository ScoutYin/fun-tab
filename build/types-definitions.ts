import { Project } from 'ts-morph';
import fastGlob from 'fast-glob';
import { readFile, remove } from 'fs-extra';
import * as vueCompiler from 'vue/compiler-sfc';
import path from 'path';
import { projectRoot, srcDir, typesDir } from './path';

export const generateTypesDefinitions = async () => {
	const project = new Project({
		compilerOptions: {
			outDir: typesDir,
			emitDeclarationOnly: true,
			baseUrl: projectRoot,
		},
		tsConfigFilePath: path.resolve(projectRoot, 'tsconfig.esm.json'),
		skipAddingFilesFromTsConfig: true,
	});

	// 读取src目录下的文件
	const files = await fastGlob('**/*.{ts,vue}', {
		cwd: srcDir,
	});

	const tasks = files.map(async (file) => {
		const fileContent = await readFile(path.resolve(srcDir, file), { encoding: 'utf-8' });
		// 处理 .vue 文件中的 <script lang="ts"> 和 <script setup lang="ts"> 内容，生成 .ts 源文件，给ts-morph处理
		if (file.endsWith('.vue')) {
			const sfc = vueCompiler.parse(fileContent);
			const { script, scriptSetup } = sfc.descriptor;
			let content = '';
			let isTs = false;

			if (script && script.lang === 'ts') {
				content += script.content;
				isTs = true;
			}

			if (scriptSetup && scriptSetup.lang === 'ts') {
				const res = vueCompiler.compileScript(sfc.descriptor, {
					// Scope ID for prefixing injected CSS variables. This must be consistent with the id passed to compileStyle.
					id: 'anyId',
				});
				content += res.content;
				isTs = true;
			}

			if (isTs) {
				project.createSourceFile(path.resolve(projectRoot, file) + '.ts', content);
			}
		} else {
			project.createSourceFile(path.resolve(projectRoot, file), fileContent);
		}
	});
	await Promise.all(tasks);

	const diagnostics = project.getPreEmitDiagnostics();
	console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));

	await project.emit({ emitOnlyDtsFiles: true });
	await remove(path.resolve(typesDir, 'tsconfig.esm.tsbuildinfo'));
};
