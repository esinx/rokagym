import { css } from '@emotion/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { Provider as JotaiProvider } from 'jotai'
import { Suspense, useEffect } from 'react'
import { Platform, View } from 'react-native'
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
import FitnessTestCriteriaScreen from '@/screens/FitnessTestCriteriaScreen'
import HomeScreen from '@/screens/HomeScreen'
import HospitalScreen from '@/screens/HospitalScreen'
import LoginScreen from '@/screens/LoginScreen'
import RankingScreen from '@/screens/RankingScreen'
import SelectBaseScreen from '@/screens/SelectBaseScreen'
import SettingsScreen from '@/screens/SettingsScreen'
import SignupScreen from '@/screens/SignupScreen'
import TrainingScreen from '@/screens/TrainingScreen'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import { navigationRef } from '@/utils/root-navigation'

export type RootStackParamList = {
	Tab: undefined
	Login: { trap?: boolean }
	Signup: { trap?: boolean }
	OnBoarding: { trap?: boolean }
	Settings: undefined
	FitnessTestCriteria: undefined
	Hospital: undefined
	SelectBase: { callback?: (baseId: string) => void }
}

export type TabParamList = {
	Home: undefined
	Ranking: undefined
	Training: undefined
}

SplashScreen.preventAutoHideAsync()

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

const App = () => {
	const [fontsLoaded] = useFonts({
		ROKA:
			Platform.OS === 'web'
				? require('./assets/fonts/roka-web.woff')
				: require('./assets/fonts/roka.otf'),
		SpoqaHanSansNeo: require('./assets/fonts/SpoqaHanSansNeo-Regular.otf'),
		SpoqaHanSansNeoBold: require('./assets/fonts/SpoqaHanSansNeo-Bold.otf'),
	})

	useEffect(() => {
		if (!fontsLoaded) {
			SplashScreen.preventAutoHideAsync()
		} else {
			SplashScreen.hideAsync()
			if (Platform.OS === 'ios' || Platform.OS === 'android') {
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
		}
	}, [fontsLoaded])

	if (!fontsLoaded) {
		return null
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
						<RootStack.Screen name="SelectBase" component={SelectBaseScreen} />
					</RootStack.Group>
					<RootStack.Group screenOptions={{ presentation: 'modal' }}>
						<RootStack.Screen name="Login" component={LoginScreen} />
						<RootStack.Screen name="Signup" component={SignupScreen} />
					</RootStack.Group>
				</RootStack.Navigator>
			</NavigationContainer>
		</MultiProvider>
	)
}

export default App
