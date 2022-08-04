import React from 'react'
import {
	Controller,
	ControllerProps,
	FieldPath,
	FieldValues,
} from 'react-hook-form'

import RGTextInput from '@/components/RGTextInput'

type Props<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, 'render'> &
	React.ComponentProps<typeof RGTextInput>

const ControlledRGTextInput = <
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
		...textInputProps
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
				<RGTextInput
					{...textInputProps}
					onBlur={onBlur}
					onChangeText={onChange}
					value={value}
				/>
			)}
		/>
	)
}

export default ControlledRGTextInput
