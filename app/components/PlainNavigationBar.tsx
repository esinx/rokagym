import { css, ReactNativeStyle } from '@emotion/native'
import { Text } from 'react-native'
import { Image, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'

const PlainNavigationBar: React.FC<{
	title?: string
	withoutInsets?: boolean
	style?: ReactNativeStyle
}> = ({ title, withoutInsets, style }) => {
	const { top: insetTop } = useSafeAreaInsets()

	return (
		<View
			style={[
				css`
					padding: 12px;
					background: #fff;
				`,
				style,
			]}
		>
			{!withoutInsets && <View style={{ height: insetTop }} />}
			<View
				style={css`
					flex-direction: row;
				`}
			>
				<Image
					source={require('@/assets/icon-small.png')}
					style={{ width: 36, height: 36, borderRadius: 18 }}
				/>
				<Text
					style={css`
						margin-left: 8px;
						font-family: ${FONT.ROKA};
						font-size: 36px;
						font-weight: 700;
						color: ${COLOR.BRAND('main')};
					`}
				>
					{title ?? '체력단련실'}
				</Text>
			</View>
		</View>
	)
}
export default PlainNavigationBar
