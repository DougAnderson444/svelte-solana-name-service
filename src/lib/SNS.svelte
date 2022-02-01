<script lang="ts">
	import SNSWrapper from './SNSWrapper.svelte';

	interface contact {
		handle: string;
		pubKey: string;
	}

	export let contacts: contact[];

	export let handle = 'DougAnderson444';
	export let pubKey;

	const handleAdd = () => {
		contacts = [...contacts, { handle, pubKey }];
		handle = ''; // clear input
	};
</script>

<!-- Pass in handle, get pubKey back  -->
<SNSWrapper {handle} bind:pubKey />

<div>
	<input class="new" placeholder="Solana PublicKey or @Twitter Handle" bind:value={handle} />
</div>

{#if handle}
	<p>
		Public Key <b>{handle}</b>: {#if pubKey}
			{pubKey}
			<div class="submit">
				<button on:click|preventDefault={handleAdd}>Add</button>
			</div>
		{/if}
	</p>
{/if}

{#if contacts}
	<ul>
		{#each contacts as contact}
			<li>{contact.handle}: {contact.pubKey}</li>
		{/each}
	</ul>
{:else}
	No Contacts
{/if}

<style>
	div {
		display: flex;
		width: auto;
	}
	input {
		flex: 1;
		padding: 1em;
		margin: 1em 0;
		background-color: white;
		border-radius: 8px !important;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
		transform: translate(-1px, -1px);
	}

	button {
		background-color: #2f89ffd1 !important;
	}
</style>
