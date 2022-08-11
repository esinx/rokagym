import { css } from '@emotion/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useSetAtom } from 'jotai'
import { SafeAreaView, Text, View, ViewProps } from 'react-native'

import { RootStackParamList } from '@/App'
import PressableHighlight from '@/components/PressableHighlight'
import { accessTokenAtom, refreshTokenAtom } from '@/store/atoms/token'
import FONT from '@/utils/fonts'

type Props = StackScreenProps<RootStackParamList, 'Settings'>

const Section: React.FC<{
	title: string
	style?: ViewProps['style']
	containerStyle?: ViewProps['style']
}> = ({ title, children, style, containerStyle }) => (
	<View
		style={[
			css`
				margin-bottom: 16px;
			`,
			style,
		]}
	>
		<Text
			style={css`
				font-family: ${FONT.SPOQA('BOLD')};
				font-size: 20px;
				padding: 8px;
			`}
		>
			{title}
		</Text>
		<View style={containerStyle}>{children}</View>
	</View>
)

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
	const setRefreshToken = useSetAtom(refreshTokenAtom)
	const setAccessToken = useSetAtom(accessTokenAtom)
	return (
		<>
			<SafeAreaView
				style={css`
					flex: 1;
					justify-content: center;
				`}
			>
				<Section
					title="개발자 메뉴"
					containerStyle={css`
						padding: 12px;
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
				</Section>
			</SafeAreaView>
		</>
	)
}

export default SettingsScreen
