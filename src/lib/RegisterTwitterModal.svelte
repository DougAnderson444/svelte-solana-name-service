<script>
	export let wallet;

	const onClickSubmit = async () => {
		if (!wallet) {
			return notify({ message: 'Connect your wallet' });
		}
		if (!twitterHandle) {
			return notify({ message: 'Enter your Twitter handle' });
		}
		if (!twitterLink) {
			return notify({ message: 'Enter the link to your tweet' });
		}

		if (twitterHandle.startsWith('@')) {
			return notify({ message: 'Enter your Twitter handle without @' });
		}

		const alreadyExists = await twitterHandleExists(connection, twitterHandle);
		if (alreadyExists) {
			return notify({
				message: 'Your Twitter handle is already registered',
				variant: 'success'
			});
		}
		const balance = await connection.getBalance(wallet.publicKey);

		if (balance === 0) {
			return notify({ message: 'Insufficient SOL' });
		}

		try {
			setLoading(true);
			const alreadyExists = await twitterHandleExists(connection, twitterHandle);
			if (alreadyExists) {
				return notify({ message: 'Handle already registered' });
			}

			// This is where the magic happens
			const instruction = await createVerifiedTwitterRegistry(
				connection,
				twitterHandle,
				wallet.publicKey,
				1_000,
				wallet.publicKey
			);
			const transaction = new Transaction().add(...instruction);
			transaction.recentBlockhash = (await connection.getRecentBlockhash('finalized')).blockhash;

			transaction.feePayer = wallet.publicKey;

			await wallet.signTransaction(transaction);

			// this is where the other half of the magic happens
			const result = await postTwitterRegistrarRequest(
				transaction,
				wallet.publicKey,
				twitterLink,
				twitterHandle
			);

			notify({
				message: 'Twitter handle claimed!',
				variant: 'success',
				txid: result?.tx
			});
			setStep((prev) => prev + 1);
		} catch (err) {
			console.warn(`Error registering your Twitter handle`);
			// @ts-ignore
			if (err.message.includes('status 400')) {
				return notify({
					message: `Error registering your Twitter handle - invalid arguments`,
					variant: 'error'
				});
			}
			// @ts-ignore
			if (err.message.includes('status 500')) {
				return notify({
					message: `Error registering your Twitter handle - internal error`,
					variant: 'error'
				});
			}
			notify({
				message: `Error registering your Twitter handle`,
				variant: 'error'
			});
		} finally {
			setLoading(false);
		}
	};
</script>

{#if step === 2}
	<div>
		<div class="search">
			<Input value={twitterLink} onChange={onChangeTwitterLink} placeholder="Twitter link" />
		</div>
		<div class="search">
			<Input
				value={twitterHandle}
				onChange={(e) => setTwitterHandle(e.target.value.trim())}
				placeholder="Twitter handle"
			/>
		</div>
	</div>
{/if}

<style>
	.search {
		display: 'flex';
		justify-content: 'flex-start';
		align-items: 'center';
		background: 'linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 61.99%)';
		border: 'double 0.5px transparent';
		background-image: 'linear-gradient(rgb(17, 19, 24), rgb(17, 19, 24)), linear-gradient(135deg, #60C0CB 18.23%, #6868FC 100%)';
		background-origin: 'border-box';
		background-clip: 'padding-box, border-box';
		text-align: 'center';
		width: '100%';
		height: '100%';
		border-radius: 8;
		max-width: 589;
		max-height: 52;
		margin-right: '2%';
		margin: 15;
		padding: 15;
	}
</style>
