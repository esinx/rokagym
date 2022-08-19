import styled, { css } from '@emotion/native'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import { useCallback, useMemo } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Alert, SafeAreaView, Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { z } from 'zod'

import { RootStackParamList } from '@/App'
import AsyncBoundary from '@/components/AsyncBoundary'
import Button from '@/components/Button'
import Controlled from '@/components/controlled'
import RGModalSelection from '@/components/RGModalSelection'
import Spacer from '@/components/Spacer'
import WorkoutIcon from '@/components/WorkoutIcon'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import { trpc } from '@/utils/trpc'
import { unitToKorean } from '@/utils/unit'

const Label = styled.Text`
	font-family: ${FONT.SPOQA('BOLD')};
	font-size: 18px;
	margin-bottom: 8px;
`

type Props = StackScreenProps<RootStackParamList, 'TrainingGoalCreation'>

const formSchema = z.object({
	workoutTypeId: z.string(),
	value: z.string(),
	extraValue: z.string().optional(),
	comment: z.string().optional(),
})

type FieldValues = z.infer<typeof formSchema>

const FormContent: React.FC = () => {
	const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

	const workoutTypesQuery = trpc.useQuery(['workout.getWorkouts'])
	const createGoalMutation = trpc.useMutation([
		'workout.createDailyWorkoutGoal',
	])

	const {
		register,
		handleSubmit,
		control,
		formState: { isValid, isSubmitting },
		...form
	} = useForm<FieldValues>({
		resolver: zodResolver(formSchema),
		mode: 'onChange',
		defaultValues: {},
	})

	const valueInput = useMemo(() => {
		const workoutTypeId = form.watch('workoutTypeId')
		switch (workoutTypeId) {
			case 'run':
				return (
					<Controlled.RGTextInput
						control={control}
						name="value"
						placeholder="5km"
						keyboardType="numeric"
					/>
				)
			case 'pushup':
			case 'situp':
				return (
					<Controlled.RGTextInput
						control={control}
						name="value"
						placeholder="50개"
						keyboardType="numeric"
					/>
				)
		}
		return null
	}, [form.watch('workoutTypeId')])

	const currentWorkoutType = useMemo(() => {
		if (!workoutTypesQuery.data || !form.watch('workoutTypeId'))
			return undefined
		return workoutTypesQuery.data.find(
			(w) => w.id === form.watch('workoutTypeId'),
		)
	}, [workoutTypesQuery.data, form.watch('workoutTypeId')])

	const onSubmit = useCallback<SubmitHandler<FieldValues>>(
		async ({ value, workoutTypeId, comment, extraValue }) => {
			try {
				const res = await createGoalMutation.mutateAsync({
					value: Number(value),
					workoutTypeId,
					comment,
					extraValue,
				})
				Alert.alert('설정 완료', '새 목표를 설정하였습니다. 화이팅!', [
					{
						text: '확인',
						onPress: () => {
							navigation.pop()
						},
					},
				])
			} catch (error) {
				console.error(error)
			}
		},
		[],
	)

	if (!workoutTypesQuery.data) return null

	return (
		<View style={css``}>
			<View>
				<Label>운동 종목</Label>
				<RGModalSelection
					options={workoutTypesQuery.data.filter(
						(w) => !w.tags.some((k) => k === 'ASSESSED'),
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
							<WorkoutIcon width={24} height={24} workoutTypeId={item.id} />
							<Spacer x={8} />
							<Text
								style={css`
									margin-left: 8px;
								`}
							>
								{item.detailedName}
							</Text>
						</View>
					)}
					renderValue={(value) =>
						value ? (
							<View
								style={css`
									flex-direction: row;
									align-items: center;
								`}
							>
								<WorkoutIcon width={24} height={24} workoutTypeId={value.id} />
								<Spacer x={8} />
								<Text
									style={css`
										margin-left: 8px;
									`}
								>
									{value.detailedName}
								</Text>
							</View>
						) : (
							<Text
								style={css`
									color: ${value ? COLOR.GRAY(900) : COLOR.GRAY(400)};
								`}
							>
								운동 종류를 선택해주세요.
							</Text>
						)
					}
					value={currentWorkoutType}
					onChange={(value) => {
						if (!value) return
						form.setValue('workoutTypeId', value.id)
					}}
				/>
			</View>
			{valueInput ? (
				<View>
					<Spacer y={24} />
					<Label>목표치</Label>
					{valueInput}
				</View>
			) : null}
			{valueInput ? (
				<View>
					<Spacer y={24} />
					<Label>목표 노트</Label>
					<Controlled.RGTextInput
						control={control}
						name="comment"
						placeholder="목표에 대한 다짐이나 기록을 남겨주세요"
					/>
				</View>
			) : null}

			{form.watch('value') ? (
				<View>
					<Spacer y={24} />
					<Button
						onPress={handleSubmit(onSubmit)}
						disabled={!isValid}
						loading={isSubmitting}
						backgroundColor={COLOR.BRAND(200)}
					>
						<View
							style={css`
								align-items: center;
							`}
						>
							<Text
								style={css`
									font-size: 18px;
									color: #ffffffcc;
								`}
							>
								새 목표 설정:
							</Text>
							<Text
								style={css`
									margin-top: 4px;
									font-size: 18px;
									font-family: ${FONT.SPOQA('BOLD')};
									color: #fff;
								`}
							>
								매일매일 {form.watch('value')}
								{unitToKorean(currentWorkoutType?.unit ?? '')}!
							</Text>
						</View>
					</Button>
				</View>
			) : null}
			<View></View>
		</View>
	)
}

const TrainingGoalCreationScreen: React.FC<Props> = ({ navigation, route }) => {
	const daily = route.params?.daily ?? false
	return (
		<>
			<SafeAreaView
				style={css`
					flex: 1;
				`}
			>
				<KeyboardAwareScrollView
					style={css`
						padding: 20px;
						padding-top: 0px;
					`}
				>
					<Text
						style={css`
							font-family: ${FONT.ROKA};
							font-size: 32px;
							color: ${COLOR.BRAND(300)};
						`}
					>
						{daily ? '일일' : '새'} 목표 설정하기
					</Text>
					<Spacer y={24} />
					<AsyncBoundary>
						<FormContent />
					</AsyncBoundary>
				</KeyboardAwareScrollView>
			</SafeAreaView>
		</>
	)
}

export default TrainingGoalCreationScreen
