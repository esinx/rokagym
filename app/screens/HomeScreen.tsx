import SkeletonContent from '@03balogun/react-native-skeleton-content'
import { css } from '@emotion/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { AntDesign } from '@expo/vector-icons'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useAtomValue } from 'jotai'
import React, { useCallback, useLayoutEffect, useRef } from 'react'
import {
	Animated,
	Dimensions,
	Platform,
	PressableProps,
	Text,
	View,
} from 'react-native'

import { RootStackParamList, TabParamList } from '@/App'
import AsyncBoundary from '@/components/AsyncBoundary'
import ErrorBox from '@/components/ErrorBox'
import FocusAwareStatusBar from '@/components/FocusAwareStatusBar'
import HomeNavigationBar from '@/components/HomeNavigationBar'
import PressableHighlight from '@/components/PressableHighlight'
import { hasValidTokensAtom } from '@/store/atoms/token'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import getGroupNameFromCode from '@/utils/group-name'
import { trpc } from '@/utils/trpc'

const { height: screenHeight, width: screenWidth } = Dimensions.get('window')

type HomeScreenNavigationProp = BottomTabNavigationProp<TabParamList, 'Home'>

const Badge: React.FC<{
	color?: string
}> = ({ children, color }) => {
	return (
		<View
			style={css`
				align-items: center;
				justify-content: center;
				margin-right: 4px;
				padding: 4px 10px;
				background-color: ${color ?? '#888'};
				border-radius: 4px;
			`}
		>
			<Text
				style={css`
					font-family: 'SpoqaHanSansNeoBold';
					font-weight: 700;
					color: #fff;
				`}
			>
				{children}
			</Text>
		</View>
	)
}

const BottomSheetContent = () => (
	<View>
		<View>
			<Text
				style={css`
					font-family: 'SpoqaHanSansNeoBold';
					font-size: 20px;
				`}
			>
				오늘의 날씨
			</Text>
			<View
				style={css`
					margin-top: 4px;
					padding: 20px;
					background: #fafafa;
					border-radius: 20px;
				`}
			>
				<Text
					style={css`
						font-family: 'SpoqaHanSansNeoBold';
						font-size: 20px;
					`}
				>
					자외선 지수: 높음 / 체감온도: 33도
				</Text>

				<Text
					style={css`
						margin-top: 10px;
						font-family: 'SpoqaHanSansNeo';
						font-size: 12px;
						color: #888;
					`}
				>
					야외활동 시 자외선과 열사병에 유의하세요. 수분을 충분히 섭취하고 30분
					활동 후에는 시원한 곳에서 휴식을 취해요.
				</Text>
			</View>
		</View>
		<View
			style={css`
				margin-top: 12px;
			`}
		>
			<Text
				style={css`
					font-family: 'SpoqaHanSansNeoBold';
					font-size: 20px;
				`}
			>
				오늘의 체력단련
			</Text>
			<View
				style={css`
					margin-top: 4px;
					padding: 20px;
					background: #fafafa;
					border-radius: 20px;
				`}
			>
				<Text
					style={css`
						font-family: 'SpoqaHanSansNeoBold';
						font-size: 20px;
					`}
				>
					윗몸일으키기(2분): 120회
				</Text>
				<Text
					style={css`
						margin-top: 10px;
						font-family: 'SpoqaHanSansNeo';
						font-size: 12px;
						color: #888;
					`}
				>
					이전 기록: 120회 / 강도: 매우 높음
				</Text>
			</View>
			<View
				style={css`
					margin-top: 4px;
					padding: 20px;
					background: #fafafa;
					border-radius: 20px;
				`}
			>
				<Text
					style={css`
						font-family: 'SpoqaHanSansNeoBold';
						font-size: 20px;
					`}
				>
					팔굽혀펴기(2분): 120회
				</Text>
				<Text
					style={css`
						margin-top: 10px;
						font-family: 'SpoqaHanSansNeo';
						font-size: 12px;
						color: #888;
					`}
				>
					이전 기록: 120회 / 강도: 매우 높음
				</Text>
			</View>
			<View
				style={css`
					margin-top: 4px;
					padding: 20px;
					background: #fafafa;
					border-radius: 20px;
				`}
			>
				<Text
					style={css`
						font-family: 'SpoqaHanSansNeoBold';
						font-size: 20px;
					`}
				>
					뜀걸음(3KM): &lt; 11:00
				</Text>
				<Text
					style={css`
						margin-top: 10px;
						font-family: 'SpoqaHanSansNeo';
						font-size: 12px;
						color: #888;
					`}
				>
					이전 기록: 11:32 / 특급
				</Text>
			</View>
		</View>
	</View>
)

const Header = () => {
	const profileQuery = trpc.useQuery(['user.profile'])

	useFocusEffect(
		useCallback(() => {
			profileQuery.refetch()
		}, []),
	)

	console.log(profileQuery.dataUpdatedAt, profileQuery.data)

	if (typeof profileQuery.data !== 'object') return null

	return (
		<View>
			<View
				style={css`
					flex-direction: row;
					justify-content: flex-end;
					align-items: center;
				`}
			>
				<Badge color="#fec02f">특급전사</Badge>
			</View>
			<Text
				style={css`
					margin-top: 4px;
					font-family: 'ROKA';
					font-size: 54px;
					text-align: right;
					color: #fff;
				`}
			>
				{profileQuery.data.rank} {profileQuery.data.name}
			</Text>
			<Text
				style={css`
					margin-top: 4px;
					font-family: ${FONT.SPOQA('BOLD')};
					font-size: 18px;
					text-align: right;
					color: ${COLOR.BRAND(100)};
				`}
			>
				{getGroupNameFromCode(profileQuery.data.base.group)}
			</Text>
			<Text
				style={css`
					margin-top: 2px;
					font-family: ${FONT.SPOQA('BOLD')};
					font-size: 14px;
					text-align: right;
					color: ${COLOR.BRAND(100)};
				`}
			>
				{profileQuery.data.base.name}
			</Text>
		</View>
	)
}

const ShortcutButton: React.FC<
	{
		color: string
		icon: React.ReactElement
		title: string
	} & PressableProps
> = ({ color, icon, title, ...passProps }) => (
	<PressableHighlight
		{...passProps}
		color={color}
		style={css`
			flex-direction: row;
			align-items: center;
			padding: 8px 12px;
			border-radius: 4px;
		`}
	>
		{icon}
		<Text
			style={css`
				font-family: ${FONT.SPOQA('BOLD')};
				font-size: 14px;
				margin-left: 4px;
				color: #fff;
			`}
		>
			{title}
		</Text>
	</PressableHighlight>
)

const HomeScreen = () => {
	const navigation = useNavigation<HomeScreenNavigationProp>()
	const hasValidTokens = useAtomValue(hasValidTokensAtom)

	const scroll = useRef(new Animated.Value(0)).current

	console.log('HomeScreen:', { hasValidTokens })

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: false,
		})
	}, [navigation])

	return (
		<>
			<View
				style={css`
					flex: 1;
					background-color: ${COLOR.BRAND('main')};
				`}
			>
				<HomeNavigationBar />
				<Animated.ScrollView
					stickyHeaderIndices={[1]}
					onScroll={Animated.event(
						[{ nativeEvent: { contentOffset: { y: scroll } } }],
						{ useNativeDriver: true },
					)}
				>
					<Animated.View
						style={{
							transform: [{ translateY: scroll }],
						}}
					>
						<AsyncBoundary
							ErrorFallback={({ error }) => {
								console.error(error)
								return (
									<View
										style={css`
											padding: 40px;
										`}
									>
										<ErrorBox
											errorText="프로필 로딩 중 오류가 발생했습니다!"
											errorCode={error.message}
										/>
									</View>
								)
							}}
							SuspenseFallback={
								<SkeletonContent
									containerStyle={css`
										align-items: flex-end;
										padding: 20px 10px;
									`}
									isLoading={true}
									animationType="pulse"
									boneColor="#ffffff11"
									highlightColor="#ffffff33"
									layout={[
										{ key: 'badges', width: 100, height: 20 },
										{
											key: 'name',
											width: 260,
											height: 64,
											marginTop: 4,
										},
										{
											key: 'group',
											width: 180,
											height: 20,
											marginTop: 4,
										},
									]}
								/>
							}
						>
							<View
								style={[
									css`
										padding: 20px 10px;
									`,
								]}
							>
								{hasValidTokens && <Header />}
								<View
									style={css`
										margin-top: 12px;
										flex-direction: row;
										justify-content: space-around;
										align-items: center;
									`}
								>
									<ShortcutButton
										color={COLOR.GREEN(300)}
										icon={
											<AntDesign name="questioncircle" size={14} color="#fff" />
										}
										title="체력검정 기준 알아보기"
										onPress={() =>
											navigation
												.getParent<StackNavigationProp<RootStackParamList>>()
												.navigate('FitnessTestCriteria')
										}
									/>
									<ShortcutButton
										color={COLOR.RED(300)}
										icon={
											<MaterialCommunityIcons
												name="car-emergency"
												size={14}
												color="#fff"
											/>
										}
										title="인근 군병원 긴급연결"
										onPress={() =>
											navigation
												.getParent<StackNavigationProp<RootStackParamList>>()
												.navigate('Hospital')
										}
									/>
								</View>
							</View>
						</AsyncBoundary>
					</Animated.View>
					<View
						style={css`
							background: ${COLOR.BRAND('main')};
						`}
					>
						<View
							style={css`
								border-top-left-radius: 10px;
								border-top-right-radius: 10px;
								height: 20px;
								background: #fff;

								align-items: center;
								justify-content: center;
							`}
						>
							<View
								style={css`
									border-radius: 5px;
									width: 40px;
									height: 5px;
									background: ${COLOR.GRAY(300)};
								`}
							/>
						</View>
					</View>
					<View
						style={css`
							padding: 10px 20px 40px 20px;
							background: #fff;
						`}
					>
						<BottomSheetContent />
					</View>
					{Platform.OS === 'ios' && (
						<View
							style={{
								backgroundColor: '#fff',
								height: screenHeight,
								position: 'absolute',
								bottom: -screenHeight,
								left: 0,
								right: 0,
							}}
						/>
					)}
				</Animated.ScrollView>
			</View>
			<FocusAwareStatusBar style="light" />
		</>
	)
}

export default HomeScreen
