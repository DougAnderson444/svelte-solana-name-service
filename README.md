# Solana Name Service - Svelte Component

```js

<script lang="ts">
	import { SNSWrapper } from '@douganderson444/svelte-solana-name-service';

	export let handle = 'DougAnderson444';
	export let pubKey;

</script>

<!-- Pass in handle, get pubKey back  -->
<SNSWrapper {handle} bind:pubKey />

{handle}'s  pubKey is: {pubKey}

```
