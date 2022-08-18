import SkeletonContent from '@03balogun/react-native-skeleton-content'
import { css } from '@emotion/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { AntDesign } from '@expo/vector-icons'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useAtomValue } from 'jotai'
import { DateTime } from 'luxon'
import React, { useCallback, useLayoutEffect, useRef } from 'react'
import {
	Animated,
	Dimensions,
	Platform,
	PressableProps,
	Text,
	View,
} from 'react-native'
import PagerView from 'react-native-pager-view'

import { RootStackParamList, TabParamList } from '@/App'
import AsyncBoundary from '@/components/AsyncBoundary'
import Button from '@/components/Button'
import ErrorBox from '@/components/ErrorBox'
import FocusAwareStatusBar from '@/components/FocusAwareStatusBar'
import HomeNavigationBar from '@/components/HomeNavigationBar'
import PressableHighlight from '@/components/PressableHighlight'
import Spacer from '@/components/Spacer'
import Spinner from '@/components/Spinner'
import { hasValidTokensAtom } from '@/store/atoms/token'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import getGroupNameFromCode from '@/utils/group-name'
import { InferQueryOutput, trpc } from '@/utils/trpc'
import {
	getApparentTemperature,
	getApparentTemperatureComment,
	getDiscomfortIndex,
	getDiscomfortIndexComment,
} from '@/utils/weather'

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
					font-family: ${FONT.SPOQA('BOLD')};
					font-weight: 700;
					color: #fff;
				`}
			>
				{children}
			</Text>
		</View>
	)
}

const getCurrentData = (
	values: InferQueryOutput<'opendata.weather.getWeatherForecast'>['TMP'],
) => {
	const now = DateTime.now()
	return values.reduce((acc, cur) => {
		const a = Math.abs(now.diff(DateTime.fromJSDate(acc.time)).as('seconds'))
		const b = Math.abs(now.diff(DateTime.fromJSDate(cur.time)).as('seconds'))
		return a > b ? cur : acc
	}, values[0])
}

const BottomSheetContent = () => {
	const navigation = useNavigation<HomeScreenNavigationProp>()

	const homescreenDataQuery = trpc.useQuery(['user.homescreen-data'])
	const userMutation = trpc.useMutation(['user.update'])
	useFocusEffect(
		useCallback(() => {
			homescreenDataQuery.refetch()
		}, []),
	)

	const mealData = homescreenDataQuery.data?.meal
	const weatherData = homescreenDataQuery.data?.weather

	const discomfortIdx = weatherData
		? Math.round(
				getDiscomfortIndex(
					Number(getCurrentData(weatherData.TMP).value),
					Number(getCurrentData(weatherData.REH).value) / 100,
				),
		  )
		: null
	const apparentTemperature = weatherData
		? Math.round(
				getApparentTemperature(
					Number(getCurrentData(weatherData.TMP).value),
					Number(getCurrentData(weatherData.WSD).value),
				),
		  )
		: null

	const shouldDisplayDiscomfortIdx =
		DateTime.now().setZone('Asia/Seoul').month < 9 &&
		DateTime.now().setZone('Asia/Seoul').month > 3

	return (
		<View>
			<View
				style={css`
					padding: 0 20px;
				`}
			>
				<Text
					style={css`
						font-family: ${FONT.SPOQA('BOLD')};
						font-size: 20px;
					`}
				>
					오늘의 날씨
				</Text>
				{shouldDisplayDiscomfortIdx ? (
					<View
						style={css`
							margin-top: 4px;
							padding: 20px;
							background: ${COLOR.GRAY(50)};
							border-radius: 20px;
						`}
					>
						<Text
							style={css`
								font-family: ${FONT.SPOQA('BOLD')};
								font-size: 20px;
							`}
						>
							{!discomfortIdx
								? '불쾌지수 기상 데이터가 없습니다.'
								: `불쾌지수: ${discomfortIdx}`}
						</Text>
						<Text
							style={css`
								margin-top: 10px;
								font-size: 12px;
								color: ${COLOR.GRAY(400)};
							`}
						>
							{discomfortIdx ? getDiscomfortIndexComment(discomfortIdx) : ''}
						</Text>
					</View>
				) : null}
				<View
					style={css`
						margin-top: 12px;
						padding: 20px;
						background: ${COLOR.GRAY(50)};
						border-radius: 20px;
					`}
				>
					<Text
						style={css`
							font-family: ${FONT.SPOQA('BOLD')};
							font-size: 20px;
						`}
					>
						{!apparentTemperature
							? '체감온도 기상 데이터가 없습니다.'
							: `체감온도: ${apparentTemperature}℃`}
					</Text>
					<Text
						style={css`
							margin-top: 10px;
							font-size: 12px;
							color: ${COLOR.GRAY(400)};
						`}
					>
						{apparentTemperature
							? getApparentTemperatureComment(apparentTemperature)
							: ''}
					</Text>
				</View>
			</View>
			<Spacer y={24} />
			<View>
				<View
					style={css`
						padding: 0 20px;
					`}
				>
					<Text
						style={css`
							font-family: ${FONT.SPOQA('BOLD')};
							font-size: 20px;
						`}
					>
						오늘의 식단
					</Text>
				</View>
				{!mealData ? (
					<View
						style={css`
							margin-top: 4px;
							padding: 20px;
							background: ${COLOR.GRAY(50)};
							border-radius: 20px;
						`}
					>
						<Text
							style={css`
								color: ${COLOR.GRAY(400)};
							`}
						>
							설정에서 식단 메뉴를 선택하고 식단 데이터를 홈 화면에
							추가해보세요!
						</Text>
						<Button
							style={css`
								margin-top: 8px;
							`}
							backgroundColor={COLOR.BRAND(200)}
							onPress={() =>
								navigation
									.getParent<StackNavigationProp<RootStackParamList>>()
									.navigate('SelectMealCode', {
										callback: async (code) => {
											const res = await userMutation.mutateAsync({
												preferredMealBaseCode: code,
											})
											homescreenDataQuery.refetch()
										},
									})
							}
						>
							<Text
								style={css`
									font-family: ${FONT.SPOQA('BOLD')};
									font-size: 18px;
									color: #fff;
								`}
							>
								식단 메뉴 선택하기
							</Text>
						</Button>
					</View>
				) : (
					<PagerView
						style={[
							{
								height:
									84 +
									20 *
										Math.max(
											...[
												mealData.breakfast,
												mealData.lunch,
												mealData.dinner,
											].map((m) => m.menus.length),
										),
							},
						]}
						initialPage={0}
					>
						{[mealData.breakfast, mealData.lunch, mealData.dinner].map(
							({ calories, menus }, idx) => (
								<View
									key={idx}
									style={css`
										padding: 12px;
									`}
								>
									<View
										style={css`
											background: ${COLOR.GRAY(50)};
											padding: 12px;
											border-radius: 12px;
										`}
									>
										<View
											style={css`
												flex-direction: row;
												justify-content: space-between;
												align-items: center;
											`}
										>
											<Text
												style={css`
													font-family: ${FONT.SPOQA('BOLD')};
													font-size: 18px;
												`}
											>
												{['아침', '점심', '저녁'][idx % 3]}
											</Text>
											<Text
												style={css`
													font-size: 16px;
													color: ${COLOR.BRAND(200)};
												`}
											>
												{calories.toFixed(2)}kcal
											</Text>
										</View>
										<View
											style={css`
												height: 1px;
												background: ${COLOR.GRAY(300)};
												border-radius: 2px;
												margin: 4px 0;
											`}
										/>
										{menus.map((menu, idx2) => (
											<Text
												style={css`
													font-size: 14px;
													margin-bottom: 4px;
												`}
												key={idx2}
											>
												{menu}
											</Text>
										))}
									</View>
								</View>
							),
						)}
					</PagerView>
				)}
			</View>
		</View>
	)
}

const Header = () => {
	const profileQuery = trpc.useQuery(['user.profile'])

	useFocusEffect(
		useCallback(() => {
			profileQuery.refetch()
		}, []),
	)

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
					font-family: ${FONT.ROKA};
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
							padding: 10px 0 40px 0;
							background: #fff;
						`}
					>
						<AsyncBoundary
							ErrorFallback={({ error }) => (
								<View
									style={css`
										padding: 40px;
									`}
								>
									<ErrorBox
										errorText="오늘의 정보 로딩 중 오류가 발생했습니다!"
										errorCode={error.message}
									/>
								</View>
							)}
							SuspenseFallback={
								<View
									style={css`
										min-height: ${screenHeight / 2}px;
										justify-content: center;
										align-items: center;
									`}
								>
									<Spinner />
								</View>
							}
						>
							{hasValidTokens && <BottomSheetContent />}
						</AsyncBoundary>
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
