import React, { useState } from 'react'
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native'
import tinycolor from 'tinycolor2'

import COLOR from '@/utils/colors'

type Props = {
	color?: string
	highlightColor?: string
	style?: StyleProp<ViewStyle>
} & PressableProps

const PressableHighlight: React.FC<Props> = (props) => {
	const {
		color = COLOR.BRAND('main'),
		highlightColor = tinycolor(color).darken().toHexString(),
		style,
		disabled,
		onPress,
		onLongPress,
		onPressIn,
		onPressOut,
		children,
		...passProps
	} = props

	const [active, setActive] = useState<boolean>(false)

	return (
		<Pressable
			{...passProps}
			accessibilityRole="button"
			onPressIn={(e) => !disabled && setActive(true) && onPressIn?.(e)}
			onPressOut={(e) => !disabled && setActive(false) && onPressOut?.(e)}
			onPress={(e) => !disabled && onPress?.(e)}
			onLongPress={(e) => !disabled && onLongPress?.(e)}
			style={[
				{
					backgroundColor: active ? highlightColor : color,
				},
				style,
			]}
		>
			{children}
		</Pressable>
	)
}

export default PressableHighlight
