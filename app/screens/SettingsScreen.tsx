import { css } from '@emotion/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useSetAtom } from 'jotai'
import { Alert, SafeAreaView, Text, View, ViewProps } from 'react-native'

import { RootStackParamList } from '@/App'
import Button from '@/components/Button'
import RGModalSelection from '@/components/RGModalSelection'
import Spacer from '@/components/Spacer'
import { accessTokenAtom, refreshTokenAtom } from '@/store/atoms/token'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import { RANKS } from '@/utils/ranks'
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

const UpdatePersonalInfoForm: React.FC = () => {
	const updateMutation = trpc.useMutation(['user.update'])
	return (
		<View>
			<View style={css``}>
				<Text
					style={css`
						font-family: ${FONT.SPOQA('BOLD')};
					`}
				>
					계급 수정하기
				</Text>
				<Spacer y={12} />
				<RGModalSelection
					options={RANKS}
					onChange={async (value) => {
						const res = await updateMutation.mutateAsync({
							rank: value,
						})
						Alert.alert('계급 수정 완료', '계급이 수정되었습니다.', [
							{
								text: '확인',
							},
						])
					}}
					renderValue={(value) =>
						value ? (
							<Text>{value}</Text>
						) : (
							<Text
								style={css`
									color: ${COLOR.GRAY(400)};
								`}
							>
								계급을 선택해주세요
							</Text>
						)
					}
					renderItem={({ item, selected }) => (
						<View
							style={css`
								padding: 12px;
								flex-direction: row;
								align-items: center;
							`}
						>
							<View
								style={css`
									width: 20px;
									height: 20px;
									border-radius: 10px;
									background: ${selected ? COLOR.BRAND(200) : '#FFF'};
									border: solid ${COLOR.GRAY(100)} 5px;
								`}
							/>
							<Spacer x={16} />
							<Text
								style={css`
									margin-left: 8px;
								`}
							>
								{item}
							</Text>
						</View>
					)}
				/>
			</View>
		</View>
	)
}

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
	const setRefreshToken = useSetAtom(refreshTokenAtom)
	const setAccessToken = useSetAtom(accessTokenAtom)

	const userMutation = trpc.useMutation(['user.update'])

	return (
		<>
			<SafeAreaView
				style={css`
					flex: 1;
				`}
			>
				<Section
					title="개인정보"
					subtitle="개인정보를 수정합니다"
					containerStyle={css`
						padding: 12px;
					`}
				>
					<Spacer y={12} />
					<UpdatePersonalInfoForm />
				</Section>
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
					title="계정"
					containerStyle={css`
						padding: 12px;
					`}
				>
					<Button
						backgroundColor={COLOR.BRAND(200)}
						onPress={() => {
							setRefreshToken(null)
							setAccessToken(null)
						}}
					>
						<Text
							style={css`
								color: white;
							`}
						>
							로그아웃
						</Text>
					</Button>
				</Section>
			</SafeAreaView>
		</>
	)
}

export default SettingsScreen
