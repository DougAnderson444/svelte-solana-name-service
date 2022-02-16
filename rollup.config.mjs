import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';
import { globbySync } from 'globby';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import alias from '@rollup/plugin-alias';
import builtins from 'rollup-plugin-node-builtins';

const production = !process.env.ROLLUP_WATCH;
const formats = [
	// 'iife',
	// 'umd',
	'es'
];

const components = [
	'SNS'
	// 'SNSWrapper'
]; // globbySync('src/lib/**/*.svelte').map((path) => path.split('/')[2]);

export default components.map((component) => ({
	input: `src/lib/index.js`, // `src/lib/${component}.svelte`,
	output: formats.map((format) => ({
		name: component,
		// file: `dist/index.js`, // gets added to deployments & package manager this way
		dir: `dist/`,
		format,
		// inlineDynamicImports: true
		sourcemap: true
	})),
	plugins: [
		json(),
		builtins(),
		typescript({
			sourceMap: !production
		}),
		,
		svelte({
			compilerOptions: {
				dev: !production
				// customElement: true
			},
			preprocess: sveltePreprocess({
				sourceMap: !production
			}),
			emitCss: false // inline
		}),
		css({ output: 'bundle.css' }), // not needed if emitCss: false
		nodeResolve({
			browser: true,
			preferBuiltins: false,
			dedupe: ['svelte']
		}),
		commonjs()
		// terser()
	],
	watch: {
		clearScreen: false
	}
}));
