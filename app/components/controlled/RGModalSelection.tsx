import React from 'react'
import {
	Controller,
	ControllerProps,
	FieldPath,
	FieldValues,
} from 'react-hook-form'

import RGModalSelection from '../RGModalSelection'

type Props<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, 'value'> &
	React.ComponentProps<typeof RGModalSelection>

const ControlledRGModalSelection = <
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
		...selectionProps
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
				<RGModalSelection
					{...selectionProps}
					onChange={(item) => {
						onChange(item)
					}}
					value={value}
				/>
			)}
		/>
	)
}

export default ControlledRGModalSelection
