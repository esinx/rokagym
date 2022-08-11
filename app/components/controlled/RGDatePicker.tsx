import React from 'react'
import {
	Controller,
	ControllerProps,
	FieldPath,
	FieldValues,
} from 'react-hook-form'

import RGDatePicker from '../RGDateInput'

type Props<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, 'render'> &
	React.ComponentProps<typeof RGDatePicker>

const ControlledRGDatePicker = <
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
				<RGDatePicker
					{...dropDownProps}
					onCancel={onBlur}
					onConfirm={(date) => {
						//@ts-expect-error
						onChange(date.toString()) && onBlur()
					}}
					date={value}
				/>
			)}
		/>
	)
}

export default ControlledRGDatePicker
