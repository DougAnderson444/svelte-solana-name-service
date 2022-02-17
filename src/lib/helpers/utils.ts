// import type { PublicKey } from '@solana/web3.js';
import { Connection, PublicKey } from '../modules/@solana/web3.js/web3.js';
// import { Connection, PublicKey } from '@solana/web3.js';

import { HASH_PREFIX, NAME_PROGRAM_ID, TWITTER_ROOT_PARENT_REGISTRY_KEY } from './constants';

import * as hash from 'hash.js';
import { deserializeUnchecked, Schema } from 'borsh';

const MAIN_NET = 'https://api.mainnet-beta.solana.com';

const SOL_TLD_AUTHORITY = new PublicKey('58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx');

export function toPublicKey(pubKey) {
	return new PublicKey(pubKey);
}

// from line
// https://github.com/solana-labs/solana-program-library/blob/3e945798fc70e111b131622c1185385c222610fd/name-service/js/src/twitter.ts#L217
// which breaks in the browser
// because crypto :(
export async function getTwitterRegistry(twitter_handle: string): Promise<NameRegistryState> {
	const hashedTwitterHandle = await getHashedName(twitter_handle);
	const twitterHandleRegistryKey = await getNameAccountKey(
		hashedTwitterHandle,
		TWITTER_ROOT_PARENT_REGISTRY_KEY
	);
	try {
		const { owner } = await NameRegistryState.retrieve(
			new Connection(MAIN_NET),
			twitterHandleRegistryKey
		);
		return owner;
	} catch (error) {
		return '';
	}
}

function getHashedName(name: string): Uint8Array {
	const input = HASH_PREFIX + name;
	return hash.sha256().update(input).digest('hex');
}

// adapted from https://github.com/solana-labs/solana-program-library/blob/3e945798fc70e111b131622c1185385c222610fd/name-service/js/src/utils.ts#L101
async function getNameAccountKey(
	hashed_name: Uint8Array,
	nameParent?: PublicKey
): Promise<PublicKey> {
	const seeds = [Buffer.from(hashed_name, 'hex')];
	seeds.push(Buffer.alloc(32)); // NameClass is blank for Twitter
	seeds.push(nameParent.toBuffer());
	const [nameAccountKey] = await PublicKey.findProgramAddress(seeds, NAME_PROGRAM_ID);
	return nameAccountKey;
}

export class NameRegistryState {
	static HEADER_LEN = 96;
	parentName: PublicKey;
	owner: PublicKey;
	class: PublicKey;
	data: Buffer | undefined;

	static schema: Schema = new Map([
		[
			NameRegistryState,
			{
				kind: 'struct',
				fields: [
					['parentName', [32]],
					['owner', [32]],
					['class', [32]]
				]
			}
		]
	]);
	constructor(obj: { parentName: Uint8Array; owner: Uint8Array; class: Uint8Array }) {
		this.parentName = new PublicKey(obj.parentName);
		this.owner = new PublicKey(obj.owner);
		this.class = new PublicKey(obj.class);
	}

	public static async retrieve(
		connection: Connection,
		nameAccountKey: PublicKey
	): Promise<NameRegistryState> {
		let nameAccount = await connection.getAccountInfo(nameAccountKey, 'processed');
		if (!nameAccount) {
			throw new Error('Invalid name account provided');
		}

		let res: NameRegistryState = deserializeUnchecked(
			this.schema,
			NameRegistryState,
			nameAccount.data
		);

		res.data = nameAccount.data?.slice(this.HEADER_LEN);

		return res;
	}
}

export const resolveSolDomain = async (input: string) => {
	// console.log('Resolvig ', { input });
	const { inputDomainKey } = await getInputKey(input);
	// console.log({ inputDomainKey });
	const { owner } = await NameRegistryState.retrieve(new Connection(MAIN_NET), inputDomainKey);
	return owner;
};

export const getInputKey = async (input: string) => {
	let hashed_input_name = await getHashedName(input);
	// console.log({ hashed_input_name });
	let inputDomainKey = await getNameAccountKey(hashed_input_name, SOL_TLD_AUTHORITY);
	// console.log({ inputDomainKey });
	return { inputDomainKey: inputDomainKey, hashedInputName: hashed_input_name };
};
