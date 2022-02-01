const TWITTER_REGISTRAR_SERVER_URL = 'https://naming-api.bonfida.com/registrar/twitter';

export const postTwitterRegistrarRequest = async (
	transaction: Transaction,
	userPubkey: PublicKey,
	twitterLink: string,
	twitterHandle: string
) => {
	const transactionBuffer = transaction.serialize({
		requireAllSignatures: false,
		verifySignatures: false
	});

	const payload = {
		transaction: JSON.stringify(transactionBuffer),
		pubkey: userPubkey.toBase58(),
		twitterLink: twitterLink,
		twitterHandle: twitterHandle
	};
	const result = await apiPost(TWITTER_REGISTRAR_SERVER_URL, payload, {
		'Content-type': 'application/json'
	});
	return result;
};
