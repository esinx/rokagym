import { css } from '@emotion/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useRef } from 'react'
import { Animated, Text, useWindowDimensions, View } from 'react-native'
import { PagerViewOnPageScrollEventData } from 'react-native-pager-view'

import { RootStackParamList } from '@/App'
import AnimatedPagerView from '@/components/AnimatedPagerView'
import AsyncBoundary from '@/components/AsyncBoundary'
import Spacer from '@/components/Spacer'
import WorkoutIcon from '@/components/WorkoutIcon'
import { useLayout } from '@/hooks/use-layout'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import { InferQueryOutput, trpc } from '@/utils/trpc'

type Props = StackScreenProps<RootStackParamList, 'AssessmentSession'>

const AssessedWorkoutsProvider: React.FC<{
	children: (
		assessedWorkouts: InferQueryOutput<'workout.getAssessedWorkouts'>,
	) => React.ReactElement
}> = ({ children }) => {
	const assessedWorkoutsQuery = trpc.useQuery(['workout.getAssessedWorkouts'])
	console.log(assessedWorkoutsQuery.data)
	if (!assessedWorkoutsQuery.data) return null
	return children(assessedWorkoutsQuery.data)
}

const PageIndicator = ({
	data,
	scrollOffsetAnimatedValue,
	positionAnimatedValue,
}: {
	data: InferQueryOutput<'workout.getAssessedWorkouts'>
	scrollOffsetAnimatedValue: Animated.Value
	positionAnimatedValue: Animated.Value
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

	console.log(layout)

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
						<Animated.View
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
						</Animated.View>
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

const AssessmentSessionScreen: React.FC<Props> = ({ navigation, route }) => {
	const { layout, onLayout } = useLayout()
	const { height } = useWindowDimensions()
	const scrollOffsetAnimatedValue = useRef(new Animated.Value(0)).current
	const positionAnimatedValue = useRef(new Animated.Value(0)).current
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
			<AsyncBoundary>
				<AssessedWorkoutsProvider>
					{(assessedWorkouts) => (
						<View>
							<PageIndicator
								data={assessedWorkouts}
								positionAnimatedValue={positionAnimatedValue}
								scrollOffsetAnimatedValue={scrollOffsetAnimatedValue}
							/>
							<AnimatedPagerView
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
									<View
										key={workout.id}
										style={css`
											padding: 20px;
										`}
									>
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
									</View>
								))}
							</AnimatedPagerView>
						</View>
					)}
				</AssessedWorkoutsProvider>
			</AsyncBoundary>
		</View>
	)
}

export default AssessmentSessionScreen
