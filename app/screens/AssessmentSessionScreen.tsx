import { css } from '@emotion/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react'
import { Animated, Text, useWindowDimensions, View } from 'react-native'
import AnimateableText from 'react-native-animateable-text'
import PagerView, {
	PagerViewOnPageScrollEventData,
} from 'react-native-pager-view'
import { PressableOpacity } from 'react-native-pressable-opacity'
import { useAnimatedProps, useSharedValue } from 'react-native-reanimated'

import { RootStackParamList } from '@/App'
import AnimatedPagerView from '@/components/AnimatedPagerView'
import AsyncBoundary from '@/components/AsyncBoundary'
import Button from '@/components/Button'
import Spacer from '@/components/Spacer'
import Spinner from '@/components/Spinner'
import WorkoutIcon from '@/components/WorkoutIcon'
import { useLayout } from '@/hooks/use-layout'
import { secondsToTimestamp, timestampToSeconds } from '@/utils'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import { InferQueryOutput, trpc } from '@/utils/trpc'
import { ArrayElement } from '@/utils/types'

type Props = StackScreenProps<RootStackParamList, 'AssessmentSession'>

const UserFitnessTestDataProvider: React.FC<{
	children: (
		fitnessTestData: InferQueryOutput<'opendata.getUserFitnessTestData'>,
	) => React.ReactElement
}> = ({ children }) => {
	const query = trpc.useQuery(['opendata.getUserFitnessTestData'])
	if (!query.data) return null
	return children(query.data)
}

const AssessedWorkoutsProvider: React.FC<{
	children: (
		assessedWorkouts: InferQueryOutput<'workout.getAssessedWorkouts'>,
	) => React.ReactElement
}> = ({ children }) => {
	const assessedWorkoutsQuery = trpc.useQuery(['workout.getAssessedWorkouts'])
	if (!assessedWorkoutsQuery.data) return null
	return children(assessedWorkoutsQuery.data)
}

const PageIndicator = ({
	data,
	scrollOffsetAnimatedValue,
	positionAnimatedValue,
	onItemTap,
}: {
	data: InferQueryOutput<'workout.getAssessedWorkouts'>
	scrollOffsetAnimatedValue: Animated.Value
	positionAnimatedValue: Animated.Value
	onItemTap?: (index: number) => void
}) => {
	const inputRange = [0, data.length]
	const { layout, onLayout } = useLayout()

	const translateX = Animated.add(
		scrollOffsetAnimatedValue,
		positionAnimatedValue,
	).interpolate({
		inputRange,
		outputRange: [layout?.x ?? 0, (layout?.x ?? 0) + (layout?.width ?? 0)],
	})

	return (
		<View>
			<View
				onLayout={onLayout}
				style={css`
					flex-direction: row;
					align-self: center;
					align-items: center;
					justify-content: center;
				`}
			>
				{data.map((workout, index) => {
					return (
						<PressableOpacity
							activeOpacity={0.9}
							onPress={() => onItemTap?.(index)}
							key={workout.id}
							style={[
								css`
									align-items: center;
									justify-content: center;
									padding: 12px;
								`,
							]}
						>
							<View
								style={css`
									width: 72px;
									height: 72px;
									border-radius: 24px;

									background: #fff;

									align-items: center;
									justify-content: center;
								`}
							>
								<WorkoutIcon
									width={36}
									height={365}
									workoutTypeId={workout.id}
								/>
							</View>
						</PressableOpacity>
					)
				})}
			</View>
			<Animated.View
				style={[
					css`
						width: 96px;
						align-items: center;
					`,
					{
						transform: [
							{
								translateX,
							},
						],
					},
				]}
			>
				<View
					style={css`
						height: 8px;
						width: 48px;
						background: ${COLOR.BRAND(100)};
						border-radius: 4px;
					`}
				/>
			</Animated.View>
		</View>
	)
}

const Timer: React.FC<{
	seconds: number
	setTime?: number[]
	onSetTime?: (time: number) => void
	onComplete?: () => void
	textProps?: React.ComponentProps<typeof Text>
}> = forwardRef((props, ref) => {
	const text = useSharedValue(String(props.seconds))
	const animatedProps = useAnimatedProps(() => {
		return {
			text: text.value,
		}
	})
	const timeLeftRef = useRef(props.seconds)
	const [started, setStarted] = useState(false)

	useImperativeHandle(ref, () => ({
		start: () => {
			setStarted(true)
		},
		clear: () => {
			setStarted(false)
			timeLeftRef.current = props.seconds
		},
	}))

	useEffect(() => {
		if (started) {
			const interval = setInterval(() => {
				timeLeftRef.current -= 0.05
				if (timeLeftRef.current <= 0) {
					props.onComplete?.()
					return clearInterval(interval)
				}
				const found = props.setTime?.find((k) => k === timeLeftRef.current)
				if (found) {
					props.onSetTime?.(found)
				}
				text.value = timeLeftRef.current.toFixed(2)
			}, 50) as unknown as number
			return () => clearInterval(interval)
		}
	}, [started])

	return (
		<AnimateableText
			{...(props.textProps ?? {})}
			animatedProps={animatedProps}
		/>
	)
})

const StopWatch: React.FC<{
	setTime?: number[]
	onSetTime?: (time: number) => void
	textProps?: React.ComponentProps<typeof Text>
}> = forwardRef((props, ref) => {
	const text = useSharedValue('00:00')
	const animatedProps = useAnimatedProps(() => {
		return {
			text: text.value,
		}
	})
	const currentTimeRef = useRef(0)
	const [running, setRunning] = useState(false)

	useImperativeHandle(ref, () => ({
		start: () => {
			setRunning(true)
		},
		stop: () => {
			setRunning(false)
		},
		clear: () => {
			setRunning(false)
			currentTimeRef.current = 0
		},
	}))

	useEffect(() => {
		if (running) {
			const interval = setInterval(() => {
				if (
					props.setTime?.some(
						(k) => k === Number(currentTimeRef.current.toFixed(2)),
					)
				) {
					props.onSetTime?.(currentTimeRef.current)
				}
				currentTimeRef.current += 0.05
				text.value = secondsToTimestamp(currentTimeRef.current, true)
			}, 50)
			return () => clearInterval(interval)
		}
	}, [running])

	return (
		<AnimateableText
			{...(props.textProps ?? {})}
			animatedProps={animatedProps}
		/>
	)
})

const AssessmentView: React.FC<{
	workout: ArrayElement<InferQueryOutput<'workout.getAssessedWorkouts'>>
	fitnessTestData: InferQueryOutput<'opendata.getFitnessTestData'>
}> = ({ workout, fitnessTestData }) => {
	const ref = useRef()

	const [started, setStarted] = useState(false)
	const [currentGrade, setCurrentGrade] = useState<string>()

	const start = () => {
		;(ref.current as any)?.start()
		setStarted(true)
	}

	const end = () => {
		if (workout.id === '3km-run') {
			;(ref.current as any)?.stop()
		} else {
			;(ref.current as any)?.clear()
		}
		setStarted(false)
	}

	return (
		<View
			key={workout.id}
			style={css`
				padding: 20px;
				justify-content: space-between;
			`}
		>
			<View>
				<Text
					style={css`
						font-family: ${FONT.ROKA};
						font-size: 40px;
						color: #fff;
						text-align: center;
					`}
				>
					{workout.detailedName}
				</Text>
				<View
					style={css`
						margin-top: 24px;
						justify-content: center;
						align-items: center;
					`}
				>
					<PressableOpacity
						activeOpacity={0.9}
						onPress={() => start()}
						style={css`
							background: #fff;
							width: 300px;
							height: 300px;
							border-radius: 150px;
							border: solid ${COLOR.BRAND(200)} 20px;
							align-items: center;
							justify-content: center;
						`}
					>
						{(workout.id === '2m-pushup' || workout.id === '2m-situp') && (
							<>
								<Timer
									/* @ts-ignore  */
									ref={ref}
									seconds={120}
									onComplete={() => end()}
									textProps={{
										style: css`
											font-family: ${FONT.SPOQA('BOLD')};
											font-size: 48px;
											color: ${COLOR.BRAND(200)};
										`,
									}}
								/>
								<Text
									style={css`
										font-family: ${FONT.SPOQA('BOLD')};
										font-size: 20px;
										color: ${COLOR.BRAND(200)};
									`}
								>
									초 남음
								</Text>
							</>
						)}
						{workout.id === '3km-run' && (
							<>
								<StopWatch
									/* @ts-ignore  */
									ref={ref}
									seconds={120}
									setTime={[
										1,
										...fitnessTestData.map((data) =>
											timestampToSeconds(data.range[0]),
										),
									]}
									onSetTime={(time) => {
										const fixedTime = Number(time.toFixed(2))
										const grade = fitnessTestData.find((data) => {
											const [a, b] = data.range.map((r) =>
												timestampToSeconds(r),
											)
											return (
												Math.min(a, b) <= fixedTime &&
												Math.max(a, b) >= fixedTime
											)
										})?.grade
										if (!grade) return
										setCurrentGrade(grade)
									}}
									textProps={{
										style: css`
											font-family: ${FONT.SPOQA('BOLD')};
											font-size: 48px;
											color: ${COLOR.BRAND(200)};
										`,
									}}
								/>
								{currentGrade && (
									<Text
										style={css`
											font-family: ${FONT.SPOQA('BOLD')};
											font-size: 20px;
											color: ${COLOR.BRAND(200)};
										`}
									>
										현재 등급: {currentGrade}
									</Text>
								)}
							</>
						)}
					</PressableOpacity>
				</View>
			</View>
			{workout.id === '3km-run' && (
				<Button
					disabled={!started}
					backgroundColor={COLOR.BRAND(200)}
					style={css`
						margin-top: 32px;
					`}
					onPress={() => end()}
				>
					<Text
						style={css`
							font-family: ${FONT.ROKA};
							font-size: 24px;
							color: #fff;
						`}
					>
						3KM 완주
					</Text>
				</Button>
			)}
		</View>
	)
}

const AssessmentSessionScreen: React.FC<Props> = ({ navigation, route }) => {
	const { layout, onLayout } = useLayout()
	const { height } = useWindowDimensions()

	const scrollOffsetAnimatedValue = useRef(new Animated.Value(0)).current
	const positionAnimatedValue = useRef(new Animated.Value(0)).current

	const pagerRef = useRef<PagerView>()

	return (
		<View
			onLayout={onLayout}
			style={css`
				flex: 1;
				padding: 20px 0;
			`}
		>
			<Text
				style={css`
					font-family: ${FONT.ROKA};
					font-size: 32px;
					color: #fff;
					text-align: center;
				`}
			>
				국군 체력측정
			</Text>
			<Spacer y={24} />
			<AsyncBoundary
				SuspenseFallback={
					<View
						style={css`
							flex: 1;
							align-items: center;
							justify-content: center;
						`}
					>
						<Spinner foregroundColor="#FFF" />
					</View>
				}
			>
				<UserFitnessTestDataProvider>
					{(fitnessTestData) => (
						<AssessedWorkoutsProvider>
							{(assessedWorkouts) => (
								<View>
									<PageIndicator
										data={assessedWorkouts}
										positionAnimatedValue={positionAnimatedValue}
										scrollOffsetAnimatedValue={scrollOffsetAnimatedValue}
										onItemTap={(idx) => pagerRef.current?.setPage(idx)}
									/>
									<AnimatedPagerView
										ref={pagerRef}
										overdrag
										onPageScroll={Animated.event<PagerViewOnPageScrollEventData>(
											[
												{
													nativeEvent: {
														offset: scrollOffsetAnimatedValue,
														position: positionAnimatedValue,
													},
												},
											],
											{
												useNativeDriver: true,
											},
										)}
										style={[
											{
												height: layout?.height ?? height,
											},
										]}
									>
										{assessedWorkouts.map((workout) => (
											<AssessmentView
												key={workout.id}
												workout={workout}
												fitnessTestData={fitnessTestData.filter(
													(d) => d.type === workout.id,
												)}
											/>
										))}
									</AnimatedPagerView>
								</View>
							)}
						</AssessedWorkoutsProvider>
					)}
				</UserFitnessTestDataProvider>
			</AsyncBoundary>
		</View>
	)
}

export default AssessmentSessionScreen
