import { useState } from 'react'
import { LayoutChangeEvent } from 'react-native'

export const useLayout = () => {
	const [layout, setLayout] = useState<
		LayoutChangeEvent['nativeEvent']['layout'] | undefined
	>()
	return {
		layout,
		onLayout: (evt: LayoutChangeEvent) => setLayout(evt.nativeEvent.layout),
	}
}
