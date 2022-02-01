import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

import { esbuildCommonjs, viteCommonjs } from '@originjs/vite-plugin-commonjs';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',

		vite: () => ({
			build: {
				rollupOptions: {
					plugins: [resolve(), commonjs()]
				}
			},
			plugins: [viteCommonjs()],
			optimizeDeps: {
				esbuildOptions: {
					plugins: [esbuildCommonjs(['@solana/web3.js'])] // the problematic cjs module
				},
				include: ['@solana/web3.js'] // also here
			}
		})
	}
};

export default config;
