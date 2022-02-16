<script lang="ts">
	import { onMount } from 'svelte';

	export let handle;
	export let pubKey;

	let mounted;
	let snsResolve;

	let showhandleAccounts;

	$: mounted && handle && showhandleAccounts();

	onMount(async () => {
		const Buffer = await import('buffer'); // Solana Web3.js uses Buffers instead of UInt8Array =/
		global.Buffer = Buffer.Buffer;

		const process = await import('process');
		global.process = process;

		showhandleAccounts = async () => {
			if (handle.length < 4) return false;

			if (handle.length < 44) {
				// TODO: check naming service
				if (!snsResolve) {
					({ snsResolve } = await import('./sns-resolver')); // https://github.com/solana-labs/solana-program-library/blob/3e945798fc70e111b131622c1185385c222610fd/name-service/js/src/twitter.ts#L217
				}

				try {
					const result = await snsResolve(handle);

					if (!result) {
						pubKey = ''; // clear pubkey results
						return;
					}
					pubKey = result;
					console.log(`Handle ${handle} points to `, pubKey.toBase58());
				} catch (error) {
					console.warn(`Handle ${handle} points to nothing.`);
				}
			}
		};

		mounted = true;
	});
</script>

<svelte:head>
	<script>
		global = globalThis; // for solana web3 repo
	</script>
</svelte:head>

<div />
