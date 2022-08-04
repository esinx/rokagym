const webpack = require('webpack')
const dotenv = require('dotenv')
const createExpoWebpackConfigAsync = require('@expo/webpack-config')
dotenv.config()
// Expo CLI will await this method so you can optionally return a promise.
module.exports = async function (env, argv) {
	const config = await createExpoWebpackConfigAsync(env, argv)
	// Maybe you want to turn off compression in dev mode.
	if (config.mode === 'development') {
		config.devServer.compress = false
	}
	// Or prevent minimizing the bundle when you build.
	if (config.mode === 'production') {
		config.optimization.minimize = false
	}
	config.plugins.add = [
		...(config.plugins.add ?? []),
		new webpack.DefinePlugin({
			'process.env': {
				BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
			},
		}),
	]
	// Finally return the new config for the CLI to use.
	return config
}
