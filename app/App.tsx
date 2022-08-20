import { css } from '@emotion/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { Provider as JotaiProvider } from 'jotai'
import { Suspense, useEffect } from 'react'
import { Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { setCustomText, setCustomTextInput } from 'react-native-global-props'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import HomeIcon from '@/components/icons/Home'
import TrophyIcon from '@/components/icons/Trophy'
import UserIcon from '@/components/icons/User'
import MultiProvider from '@/components/MultiProvider'
import PlainNavigationBar from '@/components/PlainNavigationBar'
import SessionController from '@/components/SessionController'
import Spinner from '@/components/Spinner'
import TRPCProvider from '@/components/TRPCProvider'
import useSessionEventActor from '@/hooks/use-session-event-actor'
import AssessmentSessionScreen from '@/screens/AssessmentSessionScreen'
import FitnessTestCriteriaScreen from '@/screens/FitnessTestCriteriaScreen'
import HomeScreen from '@/screens/HomeScreen'
import HospitalScreen from '@/screens/HospitalScreen'
import LoginScreen from '@/screens/LoginScreen'
import RankingScreen from '@/screens/RankingScreen'
import SelectBaseScreen from '@/screens/SelectBaseScreen'
import SelectMealCodeScreen from '@/screens/SelectMealCodeScreen'
import SelectRegionCodeScreen from '@/screens/SelectRegionCodeScreen'
import SettingsScreen from '@/screens/SettingsScreen'
import SignupScreen from '@/screens/SignupScreen'
import TrainingGoalCreationScreen from '@/screens/TrainingGoalCreationScreen'
import TrainingScreen from '@/screens/TrainingScreen'
import TrainingSessionScreen from '@/screens/TrainingSessionScreen'
import WorkoutResultScreen from '@/screens/WorkoutResultScreen'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import { navigationRef } from '@/utils/root-navigation'
import { InferQueryOutput } from '@/utils/trpc'
import { WorkoutType } from '@/utils/types'

import AssessmentRecordScreen from './screens/AssessmentRecordScreen'

type Base = InferQueryOutput<'base.baseLookup'> extends (infer E)[] ? E : never

export type RootStackParamList = {
	Tab: undefined
	Login: { trap?: boolean }
	Signup: { trap?: boolean }
	OnBoarding: { trap?: boolean }
	Settings: undefined
	FitnessTestCriteria: undefined
	Hospital: undefined
	TrainingSession: {
		workoutTypeId: string
		workoutType: WorkoutType
	}
	AssessmentSession: undefined
	AssessmentRecordManual: undefined
	AssessmentRecord: {
		records: {
			workoutTypeId: string
			value: number
		}[]
	}
	TrainingGoalCreation: {
		daily?: boolean
	}
	WorkoutResult: {
		workoutType: WorkoutType
		duration: number
	}
	SelectBase: { callback?: (base: Base) => void }
	SelectMealCode: { callback?: (mealCode: string) => void }
	SelectRegionCode: { callback?: (regionCode: string) => void }
}

export type TabParamList = {
	Home: undefined
	Ranking: undefined
	Training: undefined
}

const RootStack = createStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<TabParamList>()

const TabScreen = () => {
	useSessionEventActor()
	return (
		<Tab.Navigator
			initialRouteName="Home"
			screenOptions={{
				header: ({ route, options }) => (
					<PlainNavigationBar title={options?.title ?? route.name} />
				),
			}}
		>
			<Tab.Screen
				key="ranking"
				name="Ranking"
				component={RankingScreen}
				options={{
					title: '랭킹',
					headerTitle: '랭킹',
					tabBarIcon: ({ color, focused, size }) => (
						<TrophyIcon color={color} />
					),
				}}
			/>
			<Tab.Screen
				key="home"
				name="Home"
				component={HomeScreen}
				options={{
					title: '홈',
					headerTitle: '체력단련실',
					tabBarIcon: ({ color, focused, size }) => <HomeIcon color={color} />,
				}}
			/>
			<Tab.Screen
				key="training"
				name="Training"
				component={TrainingScreen}
				options={{
					title: '트레이닝',
					headerTitle: '트레이닝',
					tabBarIcon: ({ color, focused, size }) => <UserIcon color={color} />,
				}}
			/>
		</Tab.Navigator>
	)
}

SplashScreen.preventAutoHideAsync()
// SplashScreen.hideAsync()
const App = () => {
	console.log('render App')

	const [fontsLoaded, fontsError] = useFonts({
		ROKA: require('./assets/fonts/roka.otf'),
		SpoqaHanSansNeo: require('./assets/fonts/SpoqaHanSansNeo-Regular.otf'),
		SpoqaHanSansNeoBold: require('./assets/fonts/SpoqaHanSansNeo-Bold.otf'),
	})

	useEffect(() => {
		console.log({ fontsLoaded, fontsError })
		if (!fontsLoaded) {
			SplashScreen.preventAutoHideAsync()
		} else {
			SplashScreen.hideAsync()
			setCustomText({
				style: {
					fontFamily: 'SpoqaHanSansNeo',
				},
			})
			setCustomTextInput({
				style: {
					fontFamily: 'SpoqaHanSansNeo',
				},
			})
		}
	}, [fontsLoaded, fontsError])

	if (!fontsLoaded) {
		return (
			<View
				style={css`
					flex: 1;
					align-items: center;
					justify-content: center;
				`}
			>
				<Spinner />
				<Text
					style={css`
						margin-top: 12px;
						font-size: 20px;
						font-weight: 700;
					`}
				>
					앱 초기화중...
				</Text>
				<Text
					style={css`
						margin-top: 4px;
						font-size: 12px;
						color: #888;
					`}
				>
					앱을 최적화하는 중입니다. 잠시만 기다려주세요...
				</Text>
			</View>
		)
	}

	return (
		<MultiProvider
			providers={[
				<JotaiProvider />,
				<Suspense
					fallback={
						<View
							style={css`
								flex: 1;
								justify-content: center;
								align-items: center;
							`}
						>
							<Spinner foregroundColor={COLOR.BRAND('main')} />
						</View>
					}
				/>,
				<TRPCProvider />,
				<SessionController />,
				<GestureHandlerRootView style={{ flex: 1 }} />,
				<SafeAreaProvider />,
			]}
		>
			<NavigationContainer
				ref={navigationRef}
				documentTitle={{
					formatter: (options, route) =>
						`${options?.title ?? route?.name} - 체력단련실`,
				}}
				theme={{
					colors: {
						text: '#333',
						primary: COLOR.BRAND('main'),
						notification: '#888',
						border: '#ccc',
						background: '#fff',
						card: '#fff',
					},
					dark: false,
				}}
			>
				<RootStack.Navigator
					screenOptions={{
						headerTitleStyle: {
							fontFamily: FONT.SPOQA('BOLD'),
						},
					}}
				>
					<RootStack.Group>
						<RootStack.Screen
							name="Tab"
							component={TabScreen}
							options={{ headerShown: false, title: '메인' }}
						/>
					</RootStack.Group>
					<RootStack.Group screenOptions={{ presentation: 'modal' }}>
						<RootStack.Screen
							name="TrainingSession"
							component={TrainingSessionScreen}
							options={{
								title: '트레이닝',
								headerShown: false,
								gestureEnabled: false,
								cardStyle: {
									backgroundColor: COLOR.BRAND(300),
								},
							}}
						/>
						<RootStack.Screen
							name="AssessmentSession"
							component={AssessmentSessionScreen}
							options={{
								title: '체력측정',
								headerShown: false,
								gestureEnabled: false,
								cardStyle: {
									backgroundColor: COLOR.BRAND(300),
								},
							}}
						/>
						<RootStack.Screen
							name="WorkoutResult"
							component={WorkoutResultScreen}
							options={{
								title: '트레이닝 결과',
								headerShown: false,
								gestureEnabled: false,
								cardStyle: {
									backgroundColor: COLOR.BRAND(300),
								},
							}}
						/>
						<RootStack.Screen
							name="TrainingGoalCreation"
							component={TrainingGoalCreationScreen}
							options={{
								title: '목표설정',
								headerBackTitle: '돌아가기',
								headerStyle: {
									shadowOpacity: 0,
								},
								headerTitleStyle: {
									display: 'none',
								},
							}}
						/>
						<RootStack.Screen
							name="AssessmentRecordManual"
							component={AssessmentRecordScreen}
							options={{
								headerBackTitle: '돌아가기',
								headerStyle: {
									shadowOpacity: 0,
								},
								headerTitleStyle: {
									display: 'none',
								},
							}}
						/>
						<RootStack.Screen
							name="AssessmentRecord"
							component={AssessmentRecordScreen}
							options={{
								headerShown: false,
								headerTitleStyle: {
									display: 'none',
								},
							}}
						/>
					</RootStack.Group>
					<RootStack.Group screenOptions={{ presentation: 'modal' }}>
						<RootStack.Screen
							name="Settings"
							component={SettingsScreen}
							options={{
								title: '설정',
								headerStyle: {
									shadowOpacity: 0,
								},
							}}
						/>
					</RootStack.Group>
					<RootStack.Group screenOptions={{ presentation: 'modal' }}>
						<RootStack.Screen
							name="FitnessTestCriteria"
							component={FitnessTestCriteriaScreen}
						/>
						<RootStack.Screen name="Hospital" component={HospitalScreen} />
						<RootStack.Screen
							name="SelectBase"
							component={SelectBaseScreen}
							options={{
								title: '부대찾기',
								headerStyle: {
									shadowOpacity: 0,
								},
							}}
						/>
						<RootStack.Screen
							name="SelectMealCode"
							component={SelectMealCodeScreen}
							options={{
								title: '식단 메뉴 찾기',
								headerStyle: {
									shadowOpacity: 0,
								},
							}}
						/>
						<RootStack.Screen
							name="SelectRegionCode"
							component={SelectRegionCodeScreen}
							options={{
								title: '기상예보 위치 찾기',
								headerStyle: {
									shadowOpacity: 0,
								},
							}}
						/>
					</RootStack.Group>
					<RootStack.Group screenOptions={{ presentation: 'modal' }}>
						<RootStack.Screen name="Login" component={LoginScreen} />
						<RootStack.Screen
							name="Signup"
							component={SignupScreen}
							options={{
								title: '회원가입',
							}}
						/>
					</RootStack.Group>
				</RootStack.Navigator>
			</NavigationContainer>
		</MultiProvider>
	)
}

export default App
