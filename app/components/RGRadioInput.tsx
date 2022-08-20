import { css } from '@emotion/native'
import { useState } from 'react'
import { FlatList } from 'react-native'

import PressableHighlight from '@/components/PressableHighlight'

type Props<T> = {
	options: T[]
	value?: T

	renderItem: (args: { item: T; selected: boolean }) => React.ReactElement
	keyExtractor?: (value: T) => string

	onChange?: (value?: T) => void
	onCancel?: () => void

	flatListProps?: Omit<
		React.ComponentProps<typeof FlatList>,
		'data' | 'renderItem'
	>
}

const RGRadioInput = <T,>({
	options,
	renderItem,
	keyExtractor,
	onChange,
	onCancel,
	flatListProps,
	...props
}: Props<T>): React.ReactElement => {
	const [value, setValue] = useState(props.value)
	return (
		<>
			{/*@ts-ignore-next-line */}
			<FlatList<T>
				{...(flatListProps ?? {})}
				data={options}
				style={css`
					flex-shrink: 1;
					flex-grow: 0;
				`}
				renderItem={({ item }) => (
					<PressableHighlight
						color="#FFF"
						style={[
							css`
								border-radius: 4px;
							`,
						]}
						onPress={() => {
							setValue(item)
							onChange?.(item)
						}}
					>
						{renderItem({ item, selected: item === value })}
					</PressableHighlight>
				)}
				keyExtractor={(item, idx) => keyExtractor?.(item) ?? String(idx)}
			/>
		</>
	)
}

export default RGRadioInput
