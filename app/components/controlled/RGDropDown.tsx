import React from 'react'
import {
	Controller,
	ControllerProps,
	FieldPath,
	FieldValues,
} from 'react-hook-form'

import RGDropDown from '@/components//RGDropDown'

type Props<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, 'render'> &
	React.ComponentProps<typeof RGDropDown>

const ControlledRGDropDown = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
	props: Props<TFieldValues, TName>,
): React.ReactElement => {
	const {
		name,
		rules,
		shouldUnregister,
		defaultValue,
		control,
		...dropDownProps
	} = props

	const controllerProps = {
		name,
		rules,
		shouldUnregister,
		defaultValue,
		control,
	}

	return (
		<Controller
			{...controllerProps}
			render={({
				field: { onBlur, onChange, value },
				fieldState,
				formState,
			}) => (
				<RGDropDown
					{...dropDownProps}
					onBlur={onBlur}
					onChange={(item) => onChange(item)}
					value={value}
				/>
			)}
		/>
	)
}

export default ControlledRGDropDown
