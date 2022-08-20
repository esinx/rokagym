import { css } from '@emotion/native'
import { FontAwesome } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useCallback, useEffect, useState } from 'react'
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
import { useGradeFromFitnessData } from '@/hooks/get-grade-from-fitness-data'
import { secondsToTimestamp } from '@/utils'
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

const AssessmentEntry: React.FC<{
	data: ArrayElement<
		NonNullable<InferQueryOutput<'workout.getMostRecentAssessment'>>
	>
	grade?: string
}> = ({ data, grade }) => (
	<View
		style={css`
			background: ${COLOR.GRAY(50)};
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
					{data.type.detailedName}
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
					color: ${COLOR.GRAY(400)};
				`}
			>
				{data.type.id === '3km-run'
					? secondsToTimestamp(data.value)
					: data.value}
				{unitToKorean(data.type.unit)}
			</Text>
			{grade && (
				<Text
					style={css`
						margin-left: 4px;
						font-family: ${FONT.SPOQA('BOLD')};
						font-size: 18px;
						color: ${COLOR.BRAND(200)};
					`}
				>
					{grade}
				</Text>
			)}
		</View>
	</View>
)

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
	const assessmentQuery = trpc.useQuery(['workout.getMostRecentAssessment', {}])
	const { getGradeFromFitnessData } = useGradeFromFitnessData()
	const [gradeMap, setGradeMap] = useState<Record<string, string>>()

	const [isPullToRefresh, setIsPullToRefresh] = useState(false)

	useEffect(() => {
		;(async () => {
			if (!assessmentQuery.data) return
			const run = assessmentQuery.data.find(
				(d) => d.workoutTypeId === '3km-run',
			)
			const situp = assessmentQuery.data.find(
				(d) => d.workoutTypeId === '2m-situp',
			)
			const pushup = assessmentQuery.data.find(
				(d) => d.workoutTypeId === '2m-pushup',
			)
			const grades = await Promise.all([
				run ? getGradeFromFitnessData('3km-run', run.value) : '-급',
				situp ? getGradeFromFitnessData('2m-situp', situp.value) : '-급',
				pushup ? getGradeFromFitnessData('2m-pushup', pushup.value) : '-급',
			])
			setGradeMap({
				'3km-run': grades[0],
				'2m-situp': grades[1],
				'2m-pushup': grades[2],
			})
		})()
	}, [assessmentQuery.data])

	useFocusEffect(
		useCallback(() => {
			setIsPullToRefresh(false)
			dailyGoalQuery.refetch()
			progressQuery.refetch()
			assessmentQuery.refetch()
		}, []),
	)

	if (!dailyGoalQuery.data || !progressQuery.data || !assessmentQuery.data) {
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
			refreshing={
				isPullToRefresh &&
				(progressQuery.isRefetching || dailyGoalQuery.isRefetching)
			}
			onRefresh={() => {
				setIsPullToRefresh(true)
				progressQuery.refetch()
				dailyGoalQuery.refetch()
				assessmentQuery.refetch()
			}}
			contentContainerStyle={css`
				padding: 20px;
			`}
			stickySectionHeadersEnabled={false}
			SectionSeparatorComponent={() => <Spacer y={18} />}
			sections={[
				{
					key: progressQuery.data.length > 0 ? 'ring' : 'none',
					data: [],
				},
				{
					key: 'daily-training',
					data: progressQuery.data as any,
					keyExtractor: ({ workoutTypeId }) => workoutTypeId,
					renderItem: (({
						item,
					}: {
						item: ArrayElement<typeof progressQuery.data>
					}) => <WorkoutEntry key={item.workoutTypeId} data={item} />) as any,
				},
				{
					key: 'test-records',
					data: assessmentQuery.data as any,
					keyExtractor: ({ workoutTypeId }) => workoutTypeId,
					renderItem: (({
						item,
					}: {
						item: ArrayElement<typeof assessmentQuery.data>
					}) => (
						<AssessmentEntry
							data={item}
							grade={gradeMap?.[item.workoutTypeId]}
						/>
					)) as any,
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

					case 'test-records':
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
									나의 체력측정
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
										navigation.push('AssessmentRecordManual')
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
			renderSectionFooter={({ section: { key } }) => {
				switch (key) {
					case 'test-records':
						return (
							<PressableHighlight
								color={COLOR.BRAND(200)}
								style={css`
									margin-top: 12px;
									border-radius: 12px;
									padding: 12px;
									align-items: center;
								`}
								onPress={() => navigation.push('AssessmentSession')}
							>
								<Text
									style={css`
										font-family: ${FONT.SPOQA('BOLD')};
										font-size: 18px;
										color: #fff;
									`}
								>
									3대 체력측정 시작하기
								</Text>

								<Text
									style={css`
										margin-top: 8px;
										font-size: 14px;
										color: #ffffffcc;
									`}
								>
									3km 뜀걸음 - 2분 팔굽혀펴기 - 2분 윗몸일으키기
								</Text>
							</PressableHighlight>
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
