import { AntDesign } from '@expo/vector-icons'
import { MaterialIcons } from '@expo/vector-icons'
import { Feather } from '@expo/vector-icons'
import { useEffect, useRef, useState } from 'react'
import {
	Pressable,
	StyleProp,
	Text,
	TextInput,
	TextInputProps,
	useColorScheme,
	View,
	ViewStyle,
} from 'react-native'
import { PressableOpacity } from 'react-native-pressable-opacity'

import COLOR from '@/utils/colors'

type Props = {
	label?: string
	error?: string | false
	style?: StyleProp<ViewStyle>
	disabled?: boolean
} & TextInputProps

const RGTextInput: React.FC<Props> = (props) => {
	const {
		label,
		style,
		error,
		disabled,
		clearButtonMode,
		secureTextEntry,
		...passProps
	} = props
	const inputRef = useRef<TextInput>(null)
	const [hasFocus, setHasFocus] = useState<boolean>(false)
	const [value, setValue] = useState<string>()
	const [previewSecureText, setPreviewSecureText] = useState<boolean>(false)

	const [displayClearButton, setDisplayClearButton] = useState<boolean>(false)

	useEffect(() => {
		if (
			!disabled &&
			clearButtonMode !== 'never' &&
			(value?.length ?? passProps?.defaultValue?.length ?? 0) > 0
		) {
			if (clearButtonMode === 'always') {
				return setDisplayClearButton(true)
			}
			if (clearButtonMode === 'unless-editing' && !hasFocus) {
				return setDisplayClearButton(true)
			}
			if (clearButtonMode === 'while-editing' && hasFocus) {
				return setDisplayClearButton(true)
			}
		}
		return setDisplayClearButton(false)
	}, [disabled, value, clearButtonMode, hasFocus])

	const colorScheme = useColorScheme()

	const [
		backgroundColor,
		foregroundColor,
		highlightColor,
		placeholderColor = COLOR.GRAY(300),
		borderColor = backgroundColor,
	] = ((): (string | undefined)[] => {
		// dark mode
		if (colorScheme === 'dark') {
			if (hasFocus) return [COLOR.GRAY(800), '#fff', COLOR.GRAY(50)]
			return [COLOR.GRAY(800), '#fff', COLOR.GRAY(50)]
		}
		// disabled
		if (disabled)
			return [
				COLOR.GRAY(150),
				COLOR.GRAY(200),
				COLOR.GRAY(200),
				COLOR.GRAY(200),
			]
		if (error)
			return [
				COLOR.GRAY(50),
				COLOR.GRAY(900),
				COLOR.ALERT('neg'),
				undefined,
				COLOR.ALERT('neg'),
			]
		// focused
		if (hasFocus)
			return [
				'#fff',
				COLOR.GRAY(900),
				COLOR.BRAND(200),
				undefined,
				COLOR.BRAND(100),
			]
		// filled and not focused
		if ((value?.length ?? props?.defaultValue?.length ?? 0) > 0)
			return [COLOR.GRAY(50), COLOR.GRAY(900), COLOR.BRAND(200)]

		// not filled nor focused
		return [COLOR.GRAY(50), COLOR.GRAY(900), COLOR.GRAY(600)]
	})()

	return (
		<Pressable
			onPress={() => {
				inputRef.current?.focus()
				setHasFocus(true)
			}}
			style={style}
		>
			<View
				style={[
					{
						backgroundColor,
						padding: 10,
						borderRadius: 8,
						borderWidth: 2,
						borderColor,

						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
					},
				]}
			>
				{label && (
					<Text
						style={{
							position: 'absolute',
							top: 10,
							left: 10,
							fontSize: 14,
							color: highlightColor,
							zIndex: 1,
						}}
					>
						{label}
					</Text>
				)}
				<TextInput
					ref={inputRef}
					style={{
						flex: 1,
						backgroundColor,
						color: foregroundColor,
						fontSize: 16,
						paddingTop: label ? 14 + 8 : 0,
						paddingBottom: 0,
						paddingHorizontal: 0,
					}}
					selectionColor={COLOR.BRAND('main')}
					selectTextOnFocus={false}
					{...passProps}
					secureTextEntry={previewSecureText ? false : secureTextEntry}
					placeholderTextColor={placeholderColor}
					focusable={!disabled}
					editable={!disabled}
					clearButtonMode="never"
					value={passProps?.value ?? value}
					onChangeText={(e) => {
						setValue(e)
						passProps?.onChangeText?.(e)
					}}
					onFocus={(e) => {
						setHasFocus(true)
						passProps?.onFocus?.(e)
					}}
					onBlur={(e) => {
						setHasFocus(false)
						passProps?.onBlur?.(e)
					}}
				/>
				{secureTextEntry && (
					<PressableOpacity
						activeOpacity={0.7}
						style={{ marginLeft: 12 }}
						onPress={() => setPreviewSecureText((v) => !v)}
						hitSlop={{ top: 30, bottom: 30, left: 12, right: 12 }}
					>
						{previewSecureText ? (
							<Feather name="eye-off" size={24} color={COLOR.BRAND(200)} />
						) : (
							<Feather name="eye" size={24} color={COLOR.GRAY(400)} />
						)}
					</PressableOpacity>
				)}
				{displayClearButton && (
					<PressableOpacity
						activeOpacity={0.7}
						style={{ marginLeft: 12 }}
						onPress={() => setValue('')}
						hitSlop={{ top: 30, bottom: 30, left: 12, right: 12 }}
					>
						<AntDesign name="closecircle" size={20} color={COLOR.GRAY(400)} />
					</PressableOpacity>
				)}
			</View>

			{error && (
				<View
					style={{
						paddingVertical: 4,
						paddingHorizontal: 8,
						zIndex: -1,
						display: 'flex',
						flexDirection: 'row',
						alignContent: 'center',
					}}
				>
					<MaterialIcons
						name="error"
						size={12}
						color={borderColor}
						style={{
							marginTop: 1.5,
						}}
					/>
					<Text
						style={{
							fontSize: 12,
							marginLeft: 4,
							color: borderColor,
						}}
					>
						{error}
					</Text>
				</View>
			)}
		</Pressable>
	)
}

export default RGTextInput
