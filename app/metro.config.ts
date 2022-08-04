import { getDefaultConfig } from '@expo/metro-config'
import type MetroConfig from 'metro-config'

const defaultConfig = getDefaultConfig(__dirname)

const newConfig: MetroConfig.InputConfigT = {
	...defaultConfig,
	resolver: {
		...defaultConfig.resolver,
		assetExts: [...defaultConfig.resolver.assetExts, 'woff', 'pem'],
	},
}

module.exports = newConfig
