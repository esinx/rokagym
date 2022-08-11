import { useSetAtom } from 'jotai'
import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

import useCurrentAtomValue from '@/hooks/use-current-atom-value'
import { accessTokenAtom, refreshTokenAtom } from '@/store/atoms/token'
import { verifyJWT } from '@/utils/jwt'
import { trpc } from '@/utils/trpc'

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
						suspense: true,
						useErrorBoundary: true,
						onError: (error) => {
							console.error(error)
						},
					},
					mutations: {
						useErrorBoundary: true,
						onError: (error) => {
							console.error(error)
						},
					},
				},
			}),
		[],
	)
	const rawTrpcClient = useMemo(
		() =>
			trpc.createClient({
				url: 'http://10.10.10.84:3030' ?? process.env.BACKEND_BASE_URL,
			}),
		[],
	)
	console.log(
		`TRPCClient: process.env.BACKEND_BASE_URL=${process.env.BACKEND_BASE_URL}`,
	)
	const trpcClient = useMemo(
		() =>
			trpc.createClient({
				url: process.env.BACKEND_BASE_URL,
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
