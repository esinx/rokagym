import styled, { css } from '@emotion/native'
import { zodResolver } from '@hookform/resolvers/zod'
import { StackScreenProps } from '@react-navigation/stack'
import { useForm } from 'react-hook-form'
import { SafeAreaView, Text, View } from 'react-native'
import { z } from 'zod'

import { RootStackParamList } from '@/App'
import AsyncBoundary from '@/components/AsyncBoundary'
import RGModalSelection from '@/components/RGModalSelection'
import Spacer from '@/components/Spacer'
import WorkoutIcon from '@/components/WorkoutIcon'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import { trpc } from '@/utils/trpc'

const Label = styled.Text`
	font-family: ${FONT.SPOQA('BOLD')};
	font-size: 18px;
	margin-bottom: 8px;
`

type Props = StackScreenProps<RootStackParamList, 'TrainingGoalCreation'>

const formSchema = z.object({
	workoutTypeId: z.string(),
	value: z.number(),
	extraValue: z.string().optional(),
	comment: z.string().optional(),
})

type FieldValues = z.infer<typeof formSchema>

const Content: React.FC = () => {
	const workoutTypesQuery = trpc.useQuery(['workout.getWorkouts'])

	const {
		register,
		handleSubmit,
		control,
		formState: { isValid },
		...form
	} = useForm<FieldValues>({
		resolver: zodResolver(formSchema),
		mode: 'onChange',
		defaultValues: {},
	})

	if (!workoutTypesQuery.data) return null

	return (
		<View
			style={css`
				padding: 20px;
				padding-top: 0px;
			`}
		>
			<Text
				style={css`
					font-family: ${FONT.ROKA};
					font-size: 48px;
					color: ${COLOR.BRAND(300)};
				`}
			>
				목표 설정하기
			</Text>
			<Spacer y={24} />
			<View style={css``}>
				<View>
					<Label>운동 종류</Label>
					<RGModalSelection
						options={workoutTypesQuery.data}
						pressableProps={{
							style: css`
								border-radius: 4px;
							`,
						}}
						renderItem={({ item, selected }) => (
							<View
								style={css`
									padding: 12px;
									flex-direction: row;
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
								<WorkoutIcon workoutTypeId={item.id} />
								<Text
									style={css`
										margin-left: 8px;
									`}
								>
									{item.detailedName}
								</Text>
							</View>
						)}
						renderValue={(value) => (
							<Text
								style={css`
									color: ${value ? COLOR.GRAY(900) : COLOR.GRAY(400)};
								`}
							>
								{value ?? '운동 종류를 선택해주세요.'}
							</Text>
						)}
					/>
				</View>
				<View></View>
				<View></View>
			</View>
		</View>
	)
}

const TrainingGoalCreationScreen: React.FC<Props> = ({ navigation, route }) => {
	return (
		<>
			<SafeAreaView
				style={css`
					flex: 1;
				`}
			>
				<AsyncBoundary>
					<Content />
				</AsyncBoundary>
			</SafeAreaView>
		</>
	)
}

export default TrainingGoalCreationScreen
