import { getTwitterRegistry, resolveSolDomain } from './helpers/utils';

export const snsResolve = async (handle) => {
	let owner;
	if (!handle.endsWith('.sol')) {
		// This is a twitter handle
		try {
			owner = await getTwitterRegistry(handle.replace('@', ''));
			// owner = owner.toBytes();
		} catch {
			console.error('Failed to parse twitter handle: ', handle);
		}
	} else if (handle.endsWith('.sol')) {
		// This is .sol domain name
		try {
			// console.log('Parsing', { handle }, handle.slice(0, handle.length - 4));
			owner = await resolveSolDomain(handle.slice(0, handle.length - 4));
			// owner = owner.toBytes();
		} catch {
			console.error('Failed to parse domain name: ', handle);
		}
	}
	if (!owner) return false;
	return owner;
};
