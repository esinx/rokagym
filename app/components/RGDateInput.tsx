import { css } from '@emotion/native'
import { useState } from 'react'
import { Pressable, Text } from 'react-native'
import DatePicker, { DatePickerProps } from 'react-native-date-picker'

import COLOR from '@/utils/colors'

type ManagedProps = 'date' | 'open' | 'onCancel' | 'onConfirm'

type Props = {
	label?: string
	placeholder?: string
} & Omit<DatePickerProps, ManagedProps> &
	Partial<Pick<DatePickerProps, ManagedProps>>

const RGDatePicker: React.FC<Props> = (props) => {
	const {
		label,
		placeholder,
		onDateChange,
		onCancel,
		onConfirm,
		...passProps
	} = props

	const [date, setDate] = useState(passProps.date ?? new Date())
	const [open, setOpen] = useState(false)

	return (
		<>
			<Pressable
				onPress={() => setOpen(true)}
				style={css`
					background: ${COLOR.GRAY(50)};
					padding: 10px 10px;
					padding-bottom: 18px;
					border-radius: 8px;
				`}
			>
				{label && (
					<Text
						style={css`
							color: ${COLOR.GRAY(600)};
						`}
					>
						{label}
					</Text>
				)}
				<Text
					style={css`
						font-size: 16px;
						margin-top: ${label ? 4 : 0}px;
						color: ${date ? COLOR.GRAY(900) : COLOR.GRAY(300)};
					`}
				>
					{date?.toLocaleDateString() ?? placeholder ?? ''}
				</Text>
			</Pressable>
			<DatePicker
				modal
				open={open}
				date={date}
				onCancel={() => {
					setOpen(false)
					onCancel?.()
				}}
				onConfirm={(date) => {
					setOpen(false)
					setDate(date)
					onConfirm?.(date)
				}}
			/>
		</>
	)
}

export default RGDatePicker
