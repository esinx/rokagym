import { css } from '@emotion/native'
import { useState } from 'react'
import { Text, View } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'
import { DropdownProps } from 'react-native-element-dropdown/lib/typescript/components/Dropdown/model'

import COLOR from '@/utils/colors'

type ManagedProps = 'value' | 'onChange' | 'labelField' | 'valueField'

type Props = {} & Omit<DropdownProps, ManagedProps> &
	Partial<Pick<DropdownProps, ManagedProps>>

const RGDropDownItem: React.FC<{ text: string; selected?: boolean }> = ({
	text,
	selected,
}) => (
	<View
		style={css`
			padding: 8px 16px;
			background: ${selected ? COLOR.BRAND(200) : 'transparent'};
		`}
	>
		<Text
			style={css`
				font-size: 20px;
				color: ${selected ? '#fff' : COLOR.GRAY(900)};
			`}
		>
			{text}
		</Text>
	</View>
)

const RGDropDown: React.FC<Props> = (props) => {
	const {
		value: _value,
		labelField = 'label',
		valueField = 'value',
		...passProps
	} = props
	const [value, setValue] = useState(_value ?? null)
	return (
		<Dropdown
			{...passProps}
			labelField={labelField}
			valueField={valueField}
			value={value}
			style={css`
				padding: 10px;
				border-radius: 8px;
				background: ${COLOR.GRAY(50)};
			`}
			placeholderStyle={css`
				color: ${COLOR.GRAY(300)};
			`}
			containerStyle={css`
				background: #fff;
				box-shadow: none;
				border-radius: 8px;
				overflow: hidden;
				border: solid ${COLOR.GRAY(100)} 2px;
			`}
			renderItem={(item, selected) => (
				<RGDropDownItem text={item.label} selected={selected} />
			)}
			onChange={(v) => {
				setValue(v)
				passProps.onChange?.(v)
			}}
			autoScroll
			showsVerticalScrollIndicator
		/>
	)
}

export default RGDropDown
