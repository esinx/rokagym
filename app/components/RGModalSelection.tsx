import { css } from '@emotion/native'
import { useMemo, useState } from 'react'
import { FlatList, Text, View } from 'react-native'
import { useWindowDimensions } from 'react-native'
import Modal from 'react-native-modal'

import Button from '@/components/Button'
import PressableHighlight from '@/components/PressableHighlight'
import Spacer from '@/components/Spacer'
import COLOR from '@/utils/colors'

type Props<T> = {
	options: T[]
	value?: T

	renderItem: (args: { item: T; selected: boolean }) => React.ReactElement
	renderValue: (value?: T) => React.ReactElement
	keyExtractor?: (value: T) => string

	onChange?: (value?: T) => void
	onCancel?: () => void

	pressableProps?: React.ComponentProps<typeof PressableHighlight>
}

const RGModalSelection = <T,>({
	options,
	renderValue,
	renderItem,
	keyExtractor,
	onChange,
	onCancel,
	pressableProps,
	...props
}: Props<T>): React.ReactElement => {
	const dimensions = useWindowDimensions()
	const [value, setValue] = useState(props.value)

	const [open, setOpen] = useState(false)

	const [selected, setSelected] = useState(value)

	const renderedValue = useMemo(() => renderValue(value), [value, renderValue])

	return (
		<>
			<PressableHighlight
				onPress={() => setOpen(true)}
				color={COLOR.GRAY(50)}
				style={css`
					padding: 18px 10px;
					border-radius: 8px;
				`}
			>
				<View>{renderedValue}</View>
			</PressableHighlight>
			<Modal
				useNativeDriverForBackdrop={false}
				isVisible={open}
				onBackdropPress={() => {
					setOpen(false)
					onCancel?.()
				}}
			>
				<View
					style={[
						css`
							background: #fff;
							padding: 16px;
							border-radius: 12px;
						`,
						{
							maxHeight: dimensions.height - 200,
						},
					]}
				>
					<FlatList
						data={options}
						style={css`
							flex-shrink: 1;
							flex-grow: 0;
						`}
						renderItem={({ item }) => (
							<PressableHighlight
								color="#FFF"
								{...(pressableProps ?? {})}
								style={[
									css`
										border-radius: 4px;
									`,
									pressableProps?.style,
								]}
								onPress={() => setSelected(item)}
							>
								{renderItem({ item, selected: item === selected })}
							</PressableHighlight>
						)}
						keyExtractor={(item, idx) => keyExtractor?.(item) ?? String(idx)}
					/>
					<Spacer y={12} />
					<Button
						backgroundColor={COLOR.BRAND(200)}
						onPress={() => {
							setValue(selected)
							setOpen(false)
							onChange?.(selected)
						}}
					>
						<Text
							style={css`
								color: #fff;
							`}
						>
							확인
						</Text>
					</Button>
				</View>
			</Modal>
		</>
	)
}

export default RGModalSelection
