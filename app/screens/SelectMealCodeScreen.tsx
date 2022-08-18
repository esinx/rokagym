import { css } from '@emotion/native'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useState } from 'react'
import { FlatList, SafeAreaView, Text, View } from 'react-native'
import { PressableOpacity } from 'react-native-pressable-opacity'

import { RootStackParamList } from '@/App'
import AsyncBoundary from '@/components/AsyncBoundary'
import PressableHighlight from '@/components/PressableHighlight'
import RGTextInput from '@/components/RGTextInput'
import Spacer from '@/components/Spacer'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import { InferQueryOutput, trpc } from '@/utils/trpc'
import { ArrayElement } from '@/utils/types'
type Props = StackScreenProps<RootStackParamList, 'SelectMealCode'>

type MealData = ArrayElement<InferQueryOutput<'meal.getAllMeals'>>

const MealListProvider: React.FC<{
	children: (props: {
		data: InferQueryOutput<'meal.getAllMeals'>
	}) => React.ReactElement
}> = ({ children }) => {
	const mealsQuery = trpc.useQuery(['meal.getAllMeals'])
	if (!mealsQuery.data) return null
	return children({ data: mealsQuery.data })
}

const MealDataItem: React.FC<{
	mealData: MealData
	selected?: boolean
	onPress?: () => void
}> = ({ mealData, selected, onPress }) => (
	<PressableHighlight
		color={selected ? COLOR.BRAND(200) : '#FFF'}
		style={css`
			padding: 20px 12px;
			border-radius: 12px;
			border: solid ${selected ? COLOR.BRAND(200) : COLOR.GRAY(200)} 2px;
			width: 200px;

			align-self: flex-start;
		`}
		onPress={onPress}
	>
		{mealData.lunch.menus.map((menu) => (
			<Text
				key={menu}
				style={css`
					font-family: ${FONT.SPOQA('BOLD')};
					font-size: 18px;
					margin-bottom: 4px;
					color: ${selected ? '#FFF' : COLOR.GRAY(900)};
				`}
			>
				{menu.replace(/\(\d+\)/g, '')}
			</Text>
		))}
	</PressableHighlight>
)

const SelectMealCodeScreen: React.FC<Props> = ({ navigation, route }) => {
	const [selection, setSelection] = useState<string>()
	const [searchString, setSearchString] = useState<string>()

	useFocusEffect(
		useCallback(() => {
			navigation.setOptions({
				headerRight: () => (
					<PressableOpacity
						disabled={!selection}
						onPress={() => {
							if (!selection) return
							const code = selection.split('-')[0]
							route.params.callback?.(code)
							navigation.pop()
						}}
					>
						<Text
							style={css`
								font-size: 16px;
								color: ${COLOR.BRAND('main')};
							`}
						>
							확인
						</Text>
					</PressableOpacity>
				),
				headerRightContainerStyle: {
					paddingRight: 12,
				},
			})
		}, [selection]),
	)

	return (
		<>
			<SafeAreaView>
				<View
					style={css`
						padding: 20px;
					`}
				>
					<Text
						style={css`
							font-size: 24px;
							font-family: ${FONT.SPOQA('BOLD')};
						`}
					>
						이 중에서{'\n'}
						오늘{' '}
						<Text
							style={css`
								font-size: 24px;
								font-family: ${FONT.SPOQA('BOLD')};
								color: ${COLOR.BRAND(200)};
							`}
						>
							점심
						</Text>
						으로 나왔던{'\n'}메뉴를 선택해주세요!
					</Text>
				</View>
				<AsyncBoundary>
					<View
						style={css`
							padding: 0 20px;
						`}
					>
						<RGTextInput
							returnKeyType="search"
							//onChangeText={(value) => setSearchString(value)}
							onEndEditing={(e) => {
								setSearchString(e.nativeEvent.text)
							}}
							clearButtonMode="always"
							placeholder="메뉴 검색하기"
						/>
					</View>
					<MealListProvider>
						{({ data }) => (
							<FlatList
								horizontal
								showsHorizontalScrollIndicator={false}
								style={css`
									margin-top: 24px;
								`}
								contentContainerStyle={css`
									padding: 0 20px;
								`}
								ItemSeparatorComponent={() => <Spacer x={12} />}
								data={data.filter(
									(m) =>
										!!m.lunch &&
										(searchString
											? m.lunch.menus.some((s) => s.includes(searchString))
											: true),
								)}
								renderItem={({ item }) => (
									<MealDataItem
										key={item.id}
										mealData={item}
										selected={item.id === selection}
										onPress={() => setSelection(item.id)}
									/>
								)}
							/>
						)}
					</MealListProvider>
				</AsyncBoundary>
			</SafeAreaView>
		</>
	)
}

export default SelectMealCodeScreen
