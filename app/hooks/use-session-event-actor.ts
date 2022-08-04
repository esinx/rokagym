import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect } from 'react'

import { RootStackParamList } from '@/App'
import { useRefreshAccessToken } from '@/hooks/use-refresh-access-token'
import {
	hasValidAccessTokenAtom,
	hasValidRefreshTokenAtom,
} from '@/store/atoms/token'

const useSessionEventActor = () => {
	const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
	const refreshTokenValid = useAtomValue(hasValidRefreshTokenAtom)
	const accessTokenValid = useAtomValue(hasValidAccessTokenAtom)
	const refreshAccessToken = useRefreshAccessToken()
	const trapLogin = useCallback(
		() => navigation.navigate('Login', { trap: true }),
		[navigation],
	)
	useEffect(() => {
		if (!refreshTokenValid) {
			trapLogin()
			return
		}
		if (!accessTokenValid) {
			refreshAccessToken().catch((error) => trapLogin())
		}
	}, [navigation, refreshTokenValid, accessTokenValid])
}

export default useSessionEventActor
