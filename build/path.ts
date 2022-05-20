import { resolve } from 'path';

export const projectRoot = resolve(__dirname, '..');

export const srcDir = resolve(projectRoot, 'src');

export const outputDir = resolve(projectRoot, 'dist');

export const pkgDistDir = resolve(outputDir, 'fun-tab');

export const typesDir = resolve(outputDir, 'types');
