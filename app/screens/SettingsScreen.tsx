import { css } from '@emotion/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useSetAtom } from 'jotai'
import { SafeAreaView, Text } from 'react-native'

import { RootStackParamList } from '@/App'
import PressableHighlight from '@/components/PressableHighlight'
import { accessTokenAtom, refreshTokenAtom } from '@/store/atoms/token'

type Props = StackScreenProps<RootStackParamList, 'Login'>

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
	const setRefreshToken = useSetAtom(refreshTokenAtom)
	const setAccessToken = useSetAtom(accessTokenAtom)
	return (
		<>
			<SafeAreaView
				style={css`
					flex: 1;
					align-items: center;
					justify-content: center;
				`}
			>
				<PressableHighlight
					onPress={() => {
						navigation.navigate('Signup', { trap: false })
					}}
					style={css`
						padding: 20px 40px;
						border-radius: 8px;
					`}
				>
					<Text
						style={css`
							color: white;
						`}
					>
						Open Signup Page
					</Text>
				</PressableHighlight>
				<PressableHighlight
					onPress={() => {
						setRefreshToken(null)
						setAccessToken(null)
					}}
					style={css`
						margin-top: 20px;
						padding: 20px 40px;
						border-radius: 8px;
					`}
				>
					<Text
						style={css`
							color: white;
						`}
					>
						Reset Credentials
					</Text>
				</PressableHighlight>
			</SafeAreaView>
		</>
	)
}

export default SettingsScreen
