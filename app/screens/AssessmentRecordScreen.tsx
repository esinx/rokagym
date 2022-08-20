import styled, { css } from '@emotion/native'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import { useCallback, useEffect, useState } from 'react'
import { useMemo } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import {
	Alert,
	Keyboard,
	SafeAreaView,
	Text,
	TouchableWithoutFeedback,
	View,
} from 'react-native'
import { z } from 'zod'

import { RootStackParamList } from '@/App'
import AsyncBoundary from '@/components/AsyncBoundary'
import Button from '@/components/Button'
import Controlled from '@/components/controlled'
import PressableHighlight from '@/components/PressableHighlight'
import RGTextInput from '@/components/RGTextInput'
import Spacer from '@/components/Spacer'
import { useGradeFromFitnessData } from '@/hooks/get-grade-from-fitness-data'
import { secondsToTimestamp } from '@/utils'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import { trpc } from '@/utils/trpc'

type Props =
	| StackScreenProps<RootStackParamList, 'AssessmentRecord'>
	| StackScreenProps<RootStackParamList, 'AssessmentRecordManual'>

const Label = styled.Text`
	font-family: ${FONT.SPOQA('BOLD')};
	font-size: 18px;
	margin-bottom: 8px;
`

const formSchema = z.object({
	'3km-run': z.string(),
	'2m-situp': z.string(),
	'2m-pushup': z.string(),
})

type FieldValues = z.infer<typeof formSchema>

const FormContent: React.FC = () => {
	const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

	const workoutLogMutation = trpc.useMutation(['workout.logWorkout'])

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

	const [minutes, setMinutes] = useState<string>()
	const [seconds, setSeconds] = useState<string>()

	const onSubmit = useCallback<SubmitHandler<FieldValues>>(async (values) => {
		try {
			await Promise.all([
				workoutLogMutation.mutateAsync({
					workoutTypeId: '3km-run',
					duration: 0,
					isVerified: false,
					value: Number(values['3km-run']),
				}),
				workoutLogMutation.mutateAsync({
					workoutTypeId: '2m-situp',
					duration: 0,
					isVerified: false,
					value: Number(values['2m-situp']),
				}),
				workoutLogMutation.mutateAsync({
					workoutTypeId: '2m-pushup',
					duration: 0,
					isVerified: false,
					value: Number(values['2m-pushup']),
				}),
			])
			Alert.alert('기록 완료', '체력 측정 기록을 완료하였습니다!', [
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
	}, [])

	return (
		<View>
			<View>
				<Label>3KM 뜀걸음</Label>
				<View
					style={css`
						flex-direction: row;
						align-items: center;
					`}
				>
					<RGTextInput
						style={css`
							flex: 1;
						`}
						placeholder="12"
						keyboardType="number-pad"
						value={minutes}
						onChangeText={(text) => {
							setMinutes(text)
							form.setValue(
								'3km-run',
								String(Number(text) * 60 + Number(seconds || '0')),
								{
									shouldValidate: true,
								},
							)
						}}
					/>
					<Text
						style={css`
							margin-left: 8px;
							font-size: 18px;
						`}
					>
						분
					</Text>
					<Spacer x={12} />
					<RGTextInput
						style={css`
							flex: 1;
						`}
						placeholder="12"
						keyboardType="number-pad"
						value={seconds}
						onChangeText={(text) => {
							setSeconds(text)
							form.setValue(
								'3km-run',
								String(Number(minutes || '0') * 60 + Number(text)),
								{
									shouldValidate: true,
								},
							)
						}}
					/>
					<Text
						style={css`
							margin-left: 8px;
							font-size: 18px;
						`}
					>
						초
					</Text>
				</View>
			</View>
			<Spacer y={12} />
			<View>
				<Label>2분 팔굽혀펴기</Label>
				<Controlled.RGTextInput
					control={control}
					name="2m-pushup"
					placeholder="50개"
					keyboardType="number-pad"
				/>
			</View>
			<Spacer y={12} />
			<View>
				<Label>2분 윗몸일으키기</Label>
				<Controlled.RGTextInput
					control={control}
					name="2m-situp"
					placeholder="50개"
					keyboardType="number-pad"
				/>
			</View>
			<Spacer y={24} />
			<Button
				disabled={!isValid}
				loading={isSubmitting}
				backgroundColor={COLOR.BRAND(200)}
				onPress={handleSubmit(onSubmit)}
			>
				<Text
					style={css`
						font-family: ${FONT.ROKA};
						font-size: 18px;
						color: #fff;
					`}
				>
					기록하기
				</Text>
			</Button>
		</View>
	)
}

const InputLikeView = styled.View`
	background: ${COLOR.GRAY(50)};
	padding: 18px 10px;
	border-radius: 8px;
`

const InputLikeViewText = styled.Text`
	font-family: ${FONT.SPOQA('BOLD')};
	font-size: 18px;
`
const PrefilledContent: React.FC<{
	data: StackScreenProps<
		RootStackParamList,
		'AssessmentRecord'
	>['route']['params']['records']
}> = ({ data }) => {
	const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

	const workoutLogMutation = trpc.useMutation(['workout.logWorkout'])
	const { getGradeFromFitnessData } = useGradeFromFitnessData()

	const [gradeData, setGradeData] = useState<Record<string, string>>({})

	const values = useMemo(
		() => ({
			'3km-run':
				data.find(({ workoutTypeId }) => workoutTypeId === '3km-run')?.value ??
				0,
			'2m-situp':
				data.find(({ workoutTypeId }) => workoutTypeId === '2m-situp')?.value ??
				0,
			'2m-pushup':
				data.find(({ workoutTypeId }) => workoutTypeId === '2m-pushup')
					?.value ?? 0,
		}),
		[data],
	)

	useEffect(() => {
		;(async () => {
			const grades = await Promise.all([
				getGradeFromFitnessData('3km-run', values['3km-run']) ?? '-급',
				getGradeFromFitnessData('2m-situp', values['2m-situp']) ?? '-급',
				getGradeFromFitnessData('2m-pushup', values['2m-pushup']) ?? '-급',
			])
			setGradeData({
				'3km-run': grades[0],
				'2m-situp': grades[1],
				'2m-pushup': grades[2],
			})
		})()
	}, [values])

	const onSubmit = useCallback(async () => {
		try {
			console.log('submit', values)
			const res = await Promise.all([
				workoutLogMutation.mutateAsync({
					workoutTypeId: '3km-run',
					duration: values['3km-run'],
					isVerified: true,
					value: values['3km-run'],
				}),
				workoutLogMutation.mutateAsync({
					workoutTypeId: '2m-situp',
					duration: 2 * 60,
					isVerified: true,
					value: values['2m-situp'],
				}),
				workoutLogMutation.mutateAsync({
					workoutTypeId: '2m-pushup',
					duration: 2 * 60,
					isVerified: true,
					value: values['2m-pushup'],
				}),
			])
			console.log('complete', res)
			Alert.alert(
				'기록 완료',
				'고생하셨습니다. 체력 측정 기록을 완료하였습니다!',
				[
					{
						text: '확인',
						onPress: () => {
							navigation.pop()
						},
					},
				],
			)
		} catch (error) {
			console.error(error)
		}
	}, [workoutLogMutation])

	return (
		<View>
			<View>
				<Label>3KM 뜀걸음</Label>
				<InputLikeView
					style={css`
						flex-direction: row;
						justify-content: space-between;
					`}
				>
					<InputLikeViewText>
						{secondsToTimestamp(values['3km-run'])}
					</InputLikeViewText>
					{gradeData['3km-run'] && (
						<InputLikeViewText
							style={css`
								color: ${COLOR.BRAND(200)};
							`}
						>
							{gradeData['3km-run']}
						</InputLikeViewText>
					)}
				</InputLikeView>
			</View>
			<Spacer y={12} />
			<View>
				<Label>2분 팔굽혀펴기</Label>

				<InputLikeView
					style={css`
						flex-direction: row;
						justify-content: space-between;
					`}
				>
					<InputLikeViewText>{values['2m-pushup']}개</InputLikeViewText>
					{gradeData['2m-pushup'] && (
						<InputLikeViewText
							style={css`
								color: ${COLOR.BRAND(200)};
							`}
						>
							{gradeData['2m-pushup']}
						</InputLikeViewText>
					)}
				</InputLikeView>
			</View>
			<Spacer y={12} />
			<View>
				<Label>2분 윗몸일으키기</Label>

				<InputLikeView
					style={css`
						flex-direction: row;
						justify-content: space-between;
					`}
				>
					<InputLikeViewText>{values['2m-situp']}개</InputLikeViewText>
					{gradeData['2m-situp'] && (
						<InputLikeViewText
							style={css`
								color: ${COLOR.BRAND(200)};
							`}
						>
							{gradeData['2m-situp']}
						</InputLikeViewText>
					)}
				</InputLikeView>
			</View>
			<Spacer y={24} />
			<PressableHighlight
				style={css`
					align-items: center;
					padding: 20px;
					border-radius: 8px;
				`}
				color={COLOR.BRAND(200)}
				onPress={() => onSubmit()}
			>
				<Text
					style={css`
						font-family: ${FONT.ROKA};
						font-size: 18px;
						color: #fff;
					`}
				>
					기록하기
				</Text>
			</PressableHighlight>
		</View>
	)
}

const AssessmentRecordScreen: React.FC<Props> = ({ navigation, route }) => {
	return (
		<SafeAreaView
			style={css`
				flex: 1;
			`}
		>
			<TouchableWithoutFeedback
				onPress={() => Keyboard.dismiss()}
				style={css`
					flex: 1;
				`}
			>
				<View
					style={[
						css`
							padding: 20px;
						`,
						{
							paddingTop: route.name === 'AssessmentRecord' ? 20 : 0,
						},
					]}
				>
					<Text
						style={css`
							font-family: ${FONT.ROKA};
							font-size: 32px;
							color: ${COLOR.BRAND(300)};
						`}
					>
						체력측정 결과 기록
					</Text>
					<Spacer y={24} />
					<AsyncBoundary>
						{route.name === 'AssessmentRecord' ? (
							<PrefilledContent data={route.params.records} />
						) : (
							<FormContent />
						)}
					</AsyncBoundary>
				</View>
			</TouchableWithoutFeedback>
		</SafeAreaView>
	)
}

export default AssessmentRecordScreen
