import { css } from '@emotion/native'
import { FontAwesome } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { SafeAreaView, SectionList, Text, View } from 'react-native'

import { RootStackParamList } from '@/App'
import AsyncBoundary from '@/components/AsyncBoundary'
import ErrorBox from '@/components/ErrorBox'
import FocusAwareStatusBar from '@/components/FocusAwareStatusBar'
import PressableHighlight from '@/components/PressableHighlight'
import Rings from '@/components/Rings'
import Spacer from '@/components/Spacer'
import Spinner from '@/components/Spinner'
import WorkoutIcon from '@/components/WorkoutIcon'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import { InferQueryOutput, trpc } from '@/utils/trpc'
import { ArrayElement } from '@/utils/types'
import { unitToKorean } from '@/utils/unit'

const WorkoutEntry: React.FC<{
	data: ArrayElement<
		NonNullable<InferQueryOutput<'workout.getDailyGoalPercent'>>
	>
}> = ({ data }) => {
	const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
	return (
		<PressableHighlight
			onPress={() =>
				navigation.push('TrainingSession', {
					workoutType: data.workoutType,
					workoutTypeId: data.workoutTypeId,
				})
			}
			color={COLOR.GRAY(50)}
			style={css`
				padding: 12px;
				border-radius: 12px;
				margin-bottom: 12px;
				flex-direction: row;
				align-items: center;
				justify-content: space-between;
			`}
		>
			<View
				style={css`
					flex-direction: row;
					align-items: center;
				`}
			>
				<View
					style={css`
						background: ${COLOR.BRAND(200)};
						width: 48px;
						height: 48px;
						border-radius: 16px;
						justify-content: center;
						align-items: center;
					`}
				>
					<WorkoutIcon
						workoutTypeId={data.workoutTypeId}
						width={24}
						height={24}
						color={'#fff'}
					/>
				</View>
				<View
					style={css`
						margin-left: 8px;
					`}
				>
					<Text
						style={css`
							font-family: ${FONT.SPOQA('BOLD')};
							font-size: 18px;
						`}
					>
						{data.workoutType.detailedName}
					</Text>
					<Text
						style={css`
							font-size: 10px;
							color: ${COLOR.GRAY(400)};
						`}
					>
						시작하기 {'\u003E'}
					</Text>
				</View>
			</View>
			<View
				style={css`
					flex-direction: row;
					align-items: center;
				`}
			>
				<Text
					style={css`
						font-family: ${FONT.SPOQA('BOLD')};
						font-size: 18px;
						color: ${COLOR.GRAY(600)};
					`}
				>
					{data.currentValue}/
				</Text>
				<Text
					style={css`
						font-family: ${FONT.SPOQA('BOLD')};
						font-size: 18px;
						color: ${COLOR.BRAND(200)};
					`}
				>
					{data.goal}
					{unitToKorean(data.workoutType.unit)}
				</Text>
			</View>
		</PressableHighlight>
	)
}

const Content: React.FC = () => {
	const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
	const dailyGoalQuery = trpc.useQuery(['workout.getAllDailyGoals'])
	const progressQuery = trpc.useQuery(
		[
			'workout.getDailyGoalPercent',
			{
				workoutTypeIds: ['pushup', 'situp', 'run'],
			},
		],
		{
			refetchOnWindowFocus: true,
		},
	)
	if (!dailyGoalQuery.data || !progressQuery.data) {
		return null
	}
	// ring: run / pushup / situp
	const ringValues = [
		progressQuery.data?.find((k) => k.workoutTypeId === 'run')?.percent ?? 0,
		progressQuery.data?.find((k) => k.workoutTypeId === 'pushup')?.percent ?? 0,
		progressQuery.data?.find((k) => k.workoutTypeId === 'situp')?.percent ?? 0,
	]

	const coreProgressData = progressQuery.data.filter((k) =>
		['run', 'pushup', 'situp'].includes(k.workoutTypeId),
	)
	return (
		<SectionList
			data={dailyGoalQuery.data}
			refreshing={progressQuery.isRefetching || dailyGoalQuery.isRefetching}
			onRefresh={() => {
				progressQuery.refetch()
				dailyGoalQuery.refetch()
			}}
			contentContainerStyle={css`
				padding: 20px;
			`}
			stickySectionHeadersEnabled={false}
			SectionSeparatorComponent={() => <Spacer y={18} />}
			sections={[
				{
					key: 'ring',
					data: [],
				},
				{
					key: 'daily-training',
					data: progressQuery.data!,
					keyExtractor: ({ workoutTypeId }) => workoutTypeId,
					renderItem: ({ item }) => (
						<WorkoutEntry key={item.workoutTypeId} data={item} />
					),
				},
			]}
			renderSectionHeader={({ section: { key } }) => {
				switch (key) {
					case 'ring':
						return (
							<View
								style={css`
									padding: 20px;
									border-radius: 20px;
									flex-direction: row;
									justify-content: space-between;
									background: ${COLOR.GRAY(50)};
								`}
							>
								<Rings
									ringValues={ringValues}
									size={160}
									key={ringValues.join(',')}
								/>
								<View
									style={css`
										margin-left: 12px;
										flex: 1;
										justify-content: space-between;
									`}
								>
									<View
										style={css`
											align-items: flex-end;
										`}
									>
										<Text
											style={css`
												font-family: ${FONT.ROKA};
												font-size: 20px;
											`}
										>
											목표달성
										</Text>
										<View
											style={css`
												margin-top: 4px;
												flex-direction: row;
												align-items: flex-start;
											`}
										>
											<Text
												style={css`
													font-family: ${FONT.SPOQA('BOLD')};
													font-size: 32px;
													color: ${COLOR.BRAND(200)};
													line-height: 36px;
												`}
											>
												{(
													(progressQuery.data
														.map(({ percent }) => percent)
														.reduce((acc, cur) => acc + cur, 0) /
														progressQuery.data.length) *
													100
												).toFixed(2)}
											</Text>
											<Text
												style={css`
													font-family: ${FONT.SPOQA('BOLD')};
													font-size: 16px;
													color: ${COLOR.BRAND(200)};
												`}
											>
												%
											</Text>
										</View>
									</View>
									<View>
										{coreProgressData.map(({ workoutType, percent }) => (
											<View
												key={workoutType.id}
												style={css`
													flex-direction: row;
													justify-content: flex-end;
													align-items: center;
													margin-bottom: 4px;
												`}
											>
												<Text
													style={css`
														font-family: ${FONT.SPOQA('BOLD')};
														font-size: 12px;
														color: ${COLOR.GRAY(400)};
													`}
												>
													{workoutType.detailedName}
												</Text>
												<View
													style={css`
														margin-left: 4px;
														flex-direction: row;
														align-items: flex-start;
													`}
												>
													<Text
														style={css`
															font-family: ${FONT.SPOQA('BOLD')};
															font-size: 18px;
															color: ${COLOR.BRAND(200)};
															line-height: 20px;
														`}
													>
														{(percent * 100).toFixed(2)}
													</Text>
													<Text
														style={css`
															font-family: ${FONT.SPOQA('BOLD')};
															font-size: 8px;
															color: ${COLOR.BRAND(200)};
															line-height: 12px;
														`}
													>
														%
													</Text>
												</View>
											</View>
										))}
									</View>
								</View>
							</View>
						)
					case 'daily-training':
						return (
							<View
								style={css`
									margin-top: 20px;
									flex-direction: row;
									justify-content: space-between;
									align-items: center;
								`}
							>
								<Text
									style={css`
										font-family: ${FONT.ROKA};
										font-size: 24px;
									`}
								>
									오늘의 트레이닝
								</Text>
								<PressableHighlight
									color={COLOR.BRAND(200)}
									highlightColor={COLOR.BRAND(300)}
									style={css`
										border-radius: 20px;
										padding: 8px 12px;
										flex-direction: row;
										justify-content: space-between;
										align-items: center;
									`}
									onPress={() => {
										navigation.push('TrainingGoalCreation', {
											daily: true,
										})
									}}
								>
									<FontAwesome name="plus" size={12} color="#fff" />
									<Text
										style={css`
											margin-left: 4px;
											font-family: ${FONT.SPOQA('BOLD')};
											font-size: 14px;
											color: #fff;
										`}
									>
										추가하기
									</Text>
								</PressableHighlight>
							</View>
						)
				}
				return null
			}}
		/>
	)
}

const TrainingScreen = () => {
	return (
		<>
			<SafeAreaView
				style={css`
					flex: 1;
				`}
			>
				<AsyncBoundary
					ErrorFallback={({ error }) => (
						<View
							style={css`
								padding: 40px;
							`}
						>
							<ErrorBox
								errorText="정보 로딩 중 오류가 발생했습니다!"
								errorCode={error.message}
							/>
						</View>
					)}
					SuspenseFallback={
						<View
							style={css`
								align-items: center;
								justify-content: center;
							`}
						>
							<Spinner />
						</View>
					}
				>
					<Content />
				</AsyncBoundary>
			</SafeAreaView>
			<FocusAwareStatusBar style="dark" />
		</>
	)
}

export default TrainingScreen
