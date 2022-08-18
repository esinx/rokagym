import { TRPCClientError } from '@trpc/client'
import Constants from 'expo-constants'
import { useSetAtom } from 'jotai'
import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

import useCurrentAtomValue from '@/hooks/use-current-atom-value'
import { accessTokenAtom, refreshTokenAtom } from '@/store/atoms/token'
import { verifyJWT } from '@/utils/jwt'
import { trpc } from '@/utils/trpc'

export const BACKEND_BASE_URL =
	Constants.manifest?.extra?.backendBaseURL ?? 'https://3030.esinx.net'

const TRPCProvider: React.FC = ({ children }) => {
	const refreshTokenRef = useCurrentAtomValue(refreshTokenAtom)
	const accessTokenRef = useCurrentAtomValue(accessTokenAtom)
	const setRefreshToken = useSetAtom(refreshTokenAtom)
	const setAccessToken = useSetAtom(accessTokenAtom)
	const queryClient = useMemo(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						cacheTime: 0,
						suspense: true,
						useErrorBoundary: true,
						onError: (error) => {
							if ((error as Error).name === 'TRPCClientError') {
								if (
									(error as TRPCClientError<any>).data?.code === 'UNAUTHORIZED'
								) {
									setAccessToken(null)
									setRefreshToken(null)
								}
							}
							// console.error(error)
						},
					},
					mutations: {
						useErrorBoundary: true,
						onError: (error) => {
							if ((error as Error).name === 'TRPCClientError') {
								if (
									(error as TRPCClientError<any>).data?.code === 'UNAUTHORIZED'
								) {
									setAccessToken(null)
									setRefreshToken(null)
								}
							}
							// console.error(error)
						},
					},
				},
			}),
		[],
	)
	const rawTrpcClient = useMemo(
		() =>
			trpc.createClient({
				url: BACKEND_BASE_URL,
			}),
		[],
	)
	console.log(`TRPCClient: backend=${BACKEND_BASE_URL}`)
	const trpcClient = useMemo(
		() =>
			trpc.createClient({
				url: BACKEND_BASE_URL,
				headers: async () => {
					// not logged-in.
					if (!accessTokenRef.current || !refreshTokenRef.current) return {}
					// logged in, should check JWT validity.
					if (!verifyJWT(accessTokenRef.current)) {
						console.info('access token expired! will attempt to refresh...')
						try {
							const newToken = await rawTrpcClient.mutation(
								'user.getAccessToken',
								{
									refreshToken: refreshTokenRef.current,
								},
							)
							console.log({ newToken })
							setAccessToken(newToken.accessToken)
							return {
								Authorization: `Bearer ${newToken.accessToken}`,
							}
						} catch (error) {
							console.error(error)
							setAccessToken(null)
							setRefreshToken(null)
						}
					}
					return {
						Authorization: `Bearer ${accessTokenRef.current}`,
					}
				},
			}),
		[],
	)
	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</trpc.Provider>
	)
}

export default TRPCProvider
