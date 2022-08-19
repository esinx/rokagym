import { css } from '@emotion/native'
import { useState } from 'react'
import { Pressable, Text } from 'react-native'
import DatePicker, { DatePickerProps } from 'react-native-date-picker'

import COLOR from '@/utils/colors'

import Spacer from './Spacer'

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

	const [date, setDate] = useState(passProps.date)
	const [open, setOpen] = useState(false)

	return (
		<>
			<Pressable
				onPress={() => setOpen(true)}
				style={css`
					background: ${COLOR.GRAY(50)};
					padding: 10px;
					border-radius: 8px;
				`}
			>
				{label && (
					<>
						<Text
							style={css`
								color: ${COLOR.BRAND(200)};
							`}
						>
							{label}
						</Text>
						<Spacer y={4} />
					</>
				)}
				<Text
					style={css`
						font-size: 16px;
						color: ${date ? COLOR.GRAY(900) : COLOR.GRAY(300)};
					`}
				>
					{date?.toLocaleDateString() ?? placeholder ?? ''}
				</Text>
			</Pressable>
			<DatePicker
				modal
				mode="date"
				open={open}
				date={date ?? new Date()}
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
