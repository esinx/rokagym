import { atom } from 'jotai'

import { verifyJWT } from '@/utils/jwt'
import { atomWithSecoreStorage } from '@/utils/secure-storage-atom'

/*
 * undefined: data hasn't been loaded yet
 * null: there was an attempt to load the data but there wasn't anything to load
 * string: data has been loaded successfully
 */
type SecureStorageTokenAtom = string | null | undefined
export const refreshTokenAtom = atomWithSecoreStorage<SecureStorageTokenAtom>(
	'refreshToken',
	undefined,
)
export const accessTokenAtom = atomWithSecoreStorage<SecureStorageTokenAtom>(
	'accessToken',
	undefined,
)

export const didLoadRefreshTokenAtom = atom<boolean>(
	(read) => typeof read(refreshTokenAtom) !== 'undefined',
)
export const didLoadAccessTokenAtom = atom<boolean>(
	(read) => typeof read(accessTokenAtom) !== 'undefined',
)

const checkTokenValidity = (token: any) => {
	if (typeof token === 'string') {
		return verifyJWT(token)
	}
	return false
}

export const hasValidRefreshTokenAtom = atom((read) =>
	checkTokenValidity(read(refreshTokenAtom)),
)
export const hasValidAccessTokenAtom = atom((read) =>
	checkTokenValidity(read(accessTokenAtom)),
)
export const hasValidTokensAtom = atom(
	(read) => read(hasValidAccessTokenAtom) && read(hasValidRefreshTokenAtom),
)
