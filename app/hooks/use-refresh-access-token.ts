import { useSetAtom } from 'jotai'

import { BACKEND_BASE_URL } from '@/components/TRPCProvider'
import useCurrentAtomValue from '@/hooks/use-current-atom-value'
import { accessTokenAtom, refreshTokenAtom } from '@/store/atoms/token'
import { trpc } from '@/utils/trpc'

const trpcClient = trpc.createClient({ url: BACKEND_BASE_URL })

export const getAccessToken = async (refreshToken: string) => {
	const newToken = await trpcClient.mutation('user.getAccessToken', {
		refreshToken: refreshToken,
	})
	return newToken.accessToken
}

export const useRefreshAccessToken = () => {
	const refreshTokenRef = useCurrentAtomValue(refreshTokenAtom)
	const setRefreshToken = useSetAtom(refreshTokenAtom)
	const setAccessToken = useSetAtom(accessTokenAtom)
	return async (refreshToken: string = refreshTokenRef.current as string) => {
		try {
			if (!refreshToken) {
				throw new Error('missing refreshToken')
			}
			const newToken = await getAccessToken(refreshToken)
			setAccessToken(newToken)
			return newToken
		} catch (error) {
			console.error(error)
			setAccessToken(null)
			setRefreshToken(null)
		}
	}
}
