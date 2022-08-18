import { css } from '@emotion/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useSetAtom } from 'jotai'
import { SafeAreaView, Text, View, ViewProps } from 'react-native'

import { RootStackParamList } from '@/App'
import Button from '@/components/Button'
import PressableHighlight from '@/components/PressableHighlight'
import Spacer from '@/components/Spacer'
import { accessTokenAtom, refreshTokenAtom } from '@/store/atoms/token'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import { trpc } from '@/utils/trpc'

type Props = StackScreenProps<RootStackParamList, 'Settings'>

const Section: React.FC<{
	title: string
	subtitle?: string
	style?: ViewProps['style']
	containerStyle?: ViewProps['style']
}> = ({ title, subtitle, children, style, containerStyle }) => (
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
				padding: 0 12px;
			`}
		>
			{title}
		</Text>
		{subtitle ? (
			<Text
				style={css`
					color: ${COLOR.GRAY(400)};
					padding: 0 12px;
				`}
			>
				{subtitle}
			</Text>
		) : null}
		<View style={containerStyle}>{children}</View>
	</View>
)

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
	const setRefreshToken = useSetAtom(refreshTokenAtom)
	const setAccessToken = useSetAtom(accessTokenAtom)

	const userMutation = trpc.useMutation(['user.update'])

	return (
		<>
			<SafeAreaView
				style={css`
					flex: 1;
					justify-content: center;
				`}
			>
				<Section
					title="홈 화면 정보"
					subtitle="홈 화면에 표시되는 기상정보와 식단정보 기준을 수정합니다"
					containerStyle={css`
						padding: 12px;
					`}
				>
					<Button
						backgroundColor={COLOR.GRAY(100)}
						onPress={() => {
							navigation.navigate('SelectRegionCode', {
								callback: async (code) => {
									const res = await userMutation.mutateAsync({
										preferredRegionCode: code,
									})
									console.log({ res })
								},
							})
						}}
					>
						<Text
							style={css`
								font-family: ${FONT.SPOQA('BOLD')};
								color: ${COLOR.BRAND(200)};
							`}
						>
							기상예보 위치 변경하기
						</Text>
					</Button>
					<Spacer y={12} />
					<Button
						backgroundColor={COLOR.GRAY(100)}
						onPress={() => {
							navigation.navigate('SelectMealCode', {
								callback: async (code) => {
									const res = await userMutation.mutateAsync({
										preferredMealBaseCode: code,
									})
									console.log({ res })
								},
							})
						}}
					>
						<Text
							style={css`
								font-family: ${FONT.SPOQA('BOLD')};
								color: ${COLOR.BRAND(200)};
							`}
						>
							식단 메뉴 변경하기
						</Text>
					</Button>
				</Section>
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
