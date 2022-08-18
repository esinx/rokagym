import SkeletonContent from '@03balogun/react-native-skeleton-content'
import { css } from '@emotion/native'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { DateTime } from 'luxon'
import { useCallback, useRef, useState } from 'react'
import { Text, View } from 'react-native'

import { RootStackParamList } from '@/App'
import AsyncBoundary from '@/components/AsyncBoundary'
import Button from '@/components/Button'
import Spacer from '@/components/Spacer'
import WorkoutIcon from '@/components/WorkoutIcon'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import { trpc } from '@/utils/trpc'
import { unitToKorean } from '@/utils/unit'

type Props = StackScreenProps<RootStackParamList, 'TrainingSession'>

const RecentRecord: React.FC<{ workoutTypeId: string }> = ({
	workoutTypeId,
}) => {
	const lastRecordQuery = trpc.useQuery([
		'workout.getMostRecentLogs',
		{
			workoutTypeIds: [workoutTypeId],
		},
	])
	if (!lastRecordQuery.data) return <Text>최근 기록:-</Text>
	const log = lastRecordQuery.data.find(
		(w) => w.workoutTypeId === workoutTypeId,
	)
	return (
		<Text
			style={css`
				font-family: ${FONT.SPOQA('BOLD')};
				font-size: 18px;
				color: #fff;
			`}
		>
			최근 기록: {log?.value}
			{unitToKorean(log?.type.unit ?? '')}
		</Text>
	)
}

const padtwo = (num: Number) =>
	String(num).length >= 2 ? String(num) : '0' + num

const TrainingSessionScreen: React.FC<Props> = ({ navigation, route }) => {
	const [started, setStarted] = useState(false)
	const [startedTime, setStartedTime] = useState<DateTime>()
	const [currentDuration, setCurrentDuration] = useState<number>(0)
	const interval = useRef<number>()

	const startWorkout = useCallback(() => {
		setStarted(true)
		setStartedTime(DateTime.now())
	}, [])

	useFocusEffect(
		useCallback(() => {
			if (startedTime) {
				interval.current = setInterval(() => {
					setCurrentDuration(-1 * startedTime.diffNow().as('seconds'))
				}, 200) as unknown as number
				return () => clearInterval(interval.current)
			}
		}, [startedTime]),
	)

	return (
		<View
			style={css`
				flex: 1;
				padding: 40px 20px;
				justify-content: space-between;
			`}
		>
			<View>
				<Text
					style={css`
						font-family: ${FONT.ROKA};
						font-size: 28px;
						color: #ffffffcc;
					`}
				>
					트레이닝을 시작합니다!
				</Text>

				<View
					style={css`
						margin-top: 8px;
						flex-direction: row;
						align-items: center;
					`}
				>
					<View
						style={css`
							background: #fff;
							width: 48px;
							height: 48px;
							border-radius: 16px;
							justify-content: center;
							align-items: center;
						`}
					>
						<WorkoutIcon
							workoutTypeId={route.params.workoutTypeId}
							width={24}
							height={24}
							color={COLOR.BRAND(200)}
						/>
					</View>
					<Text
						style={css`
							margin-left: 8px;
							font-family: ${FONT.ROKA};
							font-size: 48px;
							color: #fff;
						`}
					>
						{route.params.workoutType.detailedName}
					</Text>
				</View>
			</View>
			<View>
				<AsyncBoundary
					ErrorFallback={() => null}
					SuspenseFallback={
						<SkeletonContent
							isLoading={true}
							animationType="pulse"
							boneColor="#ffffff11"
							highlightColor="#ffffff33"
							layout={[
								{
									key: 'recent',
									width: 180,
									height: 20,
								},
							]}
						/>
					}
				>
					<View
						style={css`
							align-items: center;
						`}
					>
						<RecentRecord workoutTypeId={route.params.workoutTypeId} />
					</View>
				</AsyncBoundary>
				<Text
					style={css`
						text-align: center;
						font-family: ${FONT.SPOQA('BOLD')};
						font-size: 128px;
						color: #fff;
						font-variant: tabular-nums;
					`}
				>
					{padtwo(Math.floor(currentDuration / 60))}:
					{padtwo(Math.floor(currentDuration % 60))}
				</Text>
				<Text
					style={css`
						text-align: center;
						color: #fff;
					`}
				>
					* 정당성을 위해 2분 이상 실시한 트레이닝만 기록됩니다.
				</Text>
			</View>
			<View>
				<Button
					backgroundColor="#FFF"
					onPress={() => {
						if (!started) {
							startWorkout()
						}
					}}
				>
					<Text
						style={css`
							font-family: ${FONT.ROKA};
							font-size: 24px;
							color: ${COLOR.BRAND(200)};
						`}
					>
						{started ? '마치고 기록하기' : '시작하기'}
					</Text>
				</Button>
				<Spacer y={24} />
				<Button backgroundColor="#FFF" onPress={() => navigation.pop()}>
					<Text
						style={css`
							font-family: ${FONT.ROKA};
							font-size: 24px;
							color: ${COLOR.RED(300)};
						`}
					>
						나가기
					</Text>
				</Button>
			</View>
		</View>
	)
}

export default TrainingSessionScreen
