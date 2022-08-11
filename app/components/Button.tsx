import { css } from '@emotion/native'
import React, { useState } from 'react'
import {
	Keyboard,
	Pressable,
	StyleProp,
	TouchableWithoutFeedbackProps,
	ViewStyle,
} from 'react-native'
import tinycolor from 'tinycolor2'

import Spinner from '@/components/Spinner'
import COLOR from '@/utils/colors'

type Props = TouchableWithoutFeedbackProps & {
	backgroundColor?: string
	activeColor?: string
	style?: StyleProp<ViewStyle>
	disabled?: boolean
	loading?: boolean
	spinnerProps?: React.ComponentProps<typeof Spinner>
	dismissKeyboardOnPress?: boolean
}

const Button: React.FC<Props> = (props) => {
	const {
		backgroundColor = '#333',
		activeColor,
		style,
		disabled,
		loading,
		onPress,
		onLongPress,
		onPressIn,
		onPressOut,
		children,
		dismissKeyboardOnPress,
		...passProps
	} = props

	const [active, setActive] = useState<boolean>(false)

	return (
		<Pressable
			{...passProps}
			accessibilityRole="button"
			// @ts-ignore
			onPressIn={(e) => !disabled && setActive(true) && onPressIn?.(e)}
			// @ts-ignore
			onPressOut={(e) => !disabled && setActive(false) && onPressOut?.(e)}
			onPress={(e) => {
				if (disabled) return
				dismissKeyboardOnPress && Keyboard.dismiss()
				onPress?.(e)
			}}
			onLongPress={(e) => !disabled && onLongPress?.(e)}
			style={[
				css`
					flex-direction: row;
					justify-content: center;
					align-items: center;
					padding: 16px 48px;
					border-radius: 8px;
				`,
				style,
				{
					backgroundColor: disabled
						? COLOR.GRAY(150)
						: active
						? activeColor ?? tinycolor(backgroundColor).darken(4).toHexString()
						: backgroundColor,
				},
			]}
		>
			{loading ? (
				<Spinner
					foregroundColor="#FFF"
					backgroundColor="#DDD"
					{...spinnerProps}
				/>
			) : (
				children
			)}
		</Pressable>
	)
}

export default Button
