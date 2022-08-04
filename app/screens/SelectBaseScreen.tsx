import { css } from '@emotion/native'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback } from 'react'
import { SafeAreaView, View } from 'react-native'

import { RootStackParamList } from '@/App'
import FocusAwareStatusBar from '@/components/FocusAwareStatusBar'
import RGTextInput from '@/components/RGTextInput'

type Props = StackScreenProps<RootStackParamList, 'SelectBase'>

const SelectBaseScreen: React.FC<Props> = ({ navigation, route }) => {
	useFocusEffect(
		useCallback(() => {
			navigation.setOptions({
				//headerShown: false,
			})
		}, []),
	)
	return (
		<SafeAreaView
			style={css`
				flex: 1;
			`}
		>
			<View
				style={css`
					flex: 1;
					padding: 20px;
				`}
			>
				<RGTextInput
					placeholder="부대명으로 검색"
					clearButtonMode="unless-editing"
				/>
			</View>
			<FocusAwareStatusBar style="light" />
		</SafeAreaView>
	)
}

export default SelectBaseScreen
