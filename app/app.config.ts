import 'dotenv/config'

import { ConfigContext, ExpoConfig } from '@expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: '체력단련실',
	slug: 'rokagym',
	version: '1.0.0',
	orientation: 'portrait',
	icon: './assets/icon.png',
	userInterfaceStyle: 'light',
	splash: {
		image: './assets/splash.png',
		resizeMode: 'contain',
		backgroundColor: '#ffffff',
	},
	updates: {
		fallbackToCacheTimeout: 0,
	},
	assetBundlePatterns: ['**/*'],
	ios: {
		supportsTablet: true,
		bundleIdentifier: 'net.esinx.rokagymp',
		buildNumber: '1.0.0',
	},
	android: {
		adaptiveIcon: {
			foregroundImage: './assets/adaptive-icon.png',
			backgroundColor: '#FFFFFF',
		},
		package: 'net.esinx.rokagymp',
	},
	web: {
		favicon: './assets/favicon.png',
	},
	plugins: [
		[
			'expo-community-flipper',
			{
				Flipper: '0.123.0',
				ios: {
					'Flipper-Folly': '2.6.10',
					'Flipper-RSocket': '1.4.3',
					'Flipper-DoubleConversion': '3.1.7',
					'Flipper-Glog': '0.3.9',
					'Flipper-PeerTalk': '0.0.4',
				},
			},
		],
	],
	extra: {
		backendBaseURL: process.env.BACKEND_BASE_URL,
	},
})
