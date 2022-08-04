import React, { useState } from 'react'
import {
	Pressable,
	StyleProp,
	TouchableWithoutFeedbackProps,
	View,
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
		spinnerProps,
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
		>
			<View
				style={[
					{
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'center',
						alignContent: 'center',
						paddingVertical: 16,
						paddingHorizontal: 48,
						borderRadius: 8,
					},
					style,
					{
						backgroundColor: disabled
							? COLOR.GRAY(150)
							: active
							? activeColor ??
							  tinycolor(backgroundColor).darken(4).toHexString()
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
			</View>
		</Pressable>
	)
}

export default Button
