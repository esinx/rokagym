import styled, { css } from '@emotion/native'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useState } from 'react'
import { SafeAreaView, Text, View } from 'react-native'
import { PressableOpacity } from 'react-native-pressable-opacity'

import { RootStackParamList } from '@/App'
import AsyncBoundary from '@/components/AsyncBoundary'
import RGModalSelection from '@/components/RGModalSelection'
import Spacer from '@/components/Spacer'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import { InferQueryOutput, trpc } from '@/utils/trpc'

type RegionLevelProviderProps =
	| {
			level?: []
			children: (
				data: InferQueryOutput<'opendata.getRegionCodesLevel0'>,
			) => React.ReactElement
	  }
	| {
			level: [string]
			children: (
				data: InferQueryOutput<'opendata.getRegionCodesLevel1'>,
			) => React.ReactElement
	  }
	| {
			level: [string, string]
			children: (
				data: InferQueryOutput<'opendata.getRegionCodesLevel2'>,
			) => React.ReactElement
	  }
	| {
			level: [string, string, string]
			children: (
				data: InferQueryOutput<'opendata.getRegionCodesLevel3'>,
			) => React.ReactElement
	  }

type RegionResponseByLevel<T> = T extends []
	? InferQueryOutput<'opendata.getRegionCodesLevel0'>
	: T extends [string]
	? InferQueryOutput<'opendata.getRegionCodesLevel1'>
	: T extends [string, string]
	? InferQueryOutput<'opendata.getRegionCodesLevel2'>
	: T extends [string, string, string]
	? InferQueryOutput<'opendata.getRegionCodesLevel3'>
	: InferQueryOutput<'opendata.getRegionCodes'>

const RegionLevelProvider: React.FC<RegionLevelProviderProps> = ({
	level = [],
	children,
}) => {
	const levelQuery = trpc.useQuery([
		level.length === 3
			? 'opendata.getRegionCodesLevel3'
			: level.length === 2
			? 'opendata.getRegionCodesLevel2'
			: level.length === 1
			? 'opendata.getRegionCodesLevel1'
			: 'opendata.getRegionCodesLevel0',
		level.length === 0 ? undefined : (level as any),
	])
	if (!levelQuery.data) return null
	return children(levelQuery.data as any)
}

const Label = styled.Text`
	font-family: ${FONT.SPOQA('BOLD')};
	font-size: 18px;
	margin-bottom: 8px;
`

type Props = StackScreenProps<RootStackParamList, 'SelectRegionCode'>
const SelectRegionCodeScreen: React.FC<Props> = ({ navigation, route }) => {
	const [level1, setLevel1] = useState<string>()
	const [level2, setLevel2] = useState<string>()
	const [level3, setLevel3] =
		useState<InferQueryOutput<'opendata.getRegionCodesLevel3'>>()

	const isComplete = !!level3

	useFocusEffect(
		useCallback(() => {
			navigation.setOptions({
				headerRight: () => (
					<PressableOpacity
						disabled={!isComplete}
						onPress={() => {
							if (!isComplete) return
							const code = `${level3.nx}_${level3.ny}:${level3.code}:${[
								level3.level1,
								level3.level2,
								level3.level3,
							].join('_')}`
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
		}, [level3]),
	)

	console.log({ level1, level2, level3 })

	return (
		<>
			<SafeAreaView></SafeAreaView>
			<View
				style={css`
					padding: 20px;
				`}
			>
				<AsyncBoundary>
					<RegionLevelProvider>
						{(data: RegionResponseByLevel<[]>) => (
							<View>
								<Label>1차 지역</Label>
								<RGModalSelection
									options={data.filter((d) => d !== '_')}
									onChange={(value) => value && setLevel1(value)}
									renderValue={(value) => (
										<Text
											style={css`
												color: ${value ? COLOR.GRAY(900) : COLOR.GRAY(400)};
											`}
										>
											{value ?? '지역을 선택해주세요'}
										</Text>
									)}
									renderItem={({ item, selected }) => (
										<View
											style={css`
												padding: 12px;
												flex-direction: row;
												align-items: center;
											`}
										>
											<View
												style={css`
													width: 20px;
													height: 20px;
													border-radius: 10px;
													background: ${selected ? COLOR.BRAND(200) : '#FFF'};
													border: solid ${COLOR.GRAY(100)} 5px;
												`}
											/>
											<Spacer x={16} />
											<Text
												style={css`
													margin-left: 8px;
												`}
											>
												{item}
											</Text>
										</View>
									)}
								/>
							</View>
						)}
					</RegionLevelProvider>
				</AsyncBoundary>
				{level1 ? (
					<AsyncBoundary>
						<RegionLevelProvider level={[level1]}>
							{(data: RegionResponseByLevel<[string]>) => (
								<View>
									<Spacer y={24} />
									<Label>2차 지역</Label>
									<RGModalSelection
										options={data.filter((d) => d !== '_')}
										onChange={(value) => value && setLevel2(value)}
										renderValue={(value) => (
											<Text
												style={css`
													color: ${value ? COLOR.GRAY(900) : COLOR.GRAY(400)};
												`}
											>
												{value ?? '지역을 선택해주세요'}
											</Text>
										)}
										renderItem={({ item, selected }) => (
											<View
												style={css`
													padding: 12px;
													flex-direction: row;
													align-items: center;
												`}
											>
												<View
													style={css`
														width: 20px;
														height: 20px;
														border-radius: 10px;
														background: ${selected ? COLOR.BRAND(200) : '#FFF'};
														border: solid ${COLOR.GRAY(100)} 5px;
													`}
												/>
												<Spacer x={16} />
												<Text
													style={css`
														margin-left: 8px;
													`}
												>
													{item}
												</Text>
											</View>
										)}
									/>
								</View>
							)}
						</RegionLevelProvider>
					</AsyncBoundary>
				) : null}
				{level1 && level2 ? (
					<AsyncBoundary>
						<RegionLevelProvider level={[level1, level2]}>
							{(data: RegionResponseByLevel<[string, string]>) => (
								<View>
									<Spacer y={24} />
									<Label>3차 지역</Label>
									<RGModalSelection
										options={data}
										onChange={(value) => value && setLevel3(value)}
										renderValue={(value) => (
											<Text
												style={css`
													color: ${value ? COLOR.GRAY(900) : COLOR.GRAY(400)};
												`}
											>
												{(value?.level3 || value?.level2) ??
													'지역을 선택해주세요'}
											</Text>
										)}
										renderItem={({ item, selected }) => (
											<View
												style={css`
													padding: 12px;
													flex-direction: row;
													align-items: center;
												`}
											>
												<View
													style={css`
														width: 20px;
														height: 20px;
														border-radius: 10px;
														background: ${selected ? COLOR.BRAND(200) : '#FFF'};
														border: solid ${COLOR.GRAY(100)} 5px;
													`}
												/>
												<Spacer x={16} />
												<Text
													style={css`
														margin-left: 8px;
													`}
												>
													{item?.level3 || item?.level2}
												</Text>
											</View>
										)}
									/>
								</View>
							)}
						</RegionLevelProvider>
					</AsyncBoundary>
				) : null}
			</View>
		</>
	)
}

export default SelectRegionCodeScreen
