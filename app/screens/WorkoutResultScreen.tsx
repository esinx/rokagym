import { css } from '@emotion/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useState } from 'react'
import { Alert, Text, TextInput, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { RootStackParamList } from '@/App'
import Button from '@/components/Button'
import { useLayout } from '@/hooks/use-layout'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import { trpc } from '@/utils/trpc'

type Props = StackScreenProps<RootStackParamList, 'WorkoutResult'>

const WorkoutResultScreen: React.FC<Props> = ({ navigation, route }) => {
	const { layout, onLayout } = useLayout()

	const workoutLogMutation = trpc.useMutation(['workout.logWorkout'])

	const [value, setValue] = useState<string>()
	const [extraValue, setExtraValue] = useState<string>()
	const [comment, setComment] = useState<string>()

	const onSubmit = async () => {
		const res = await workoutLogMutation.mutateAsync({
			workoutTypeId: route.params.workoutType.id,
			duration: route.params.duration,
			value: Number(value),
			isVerified: false,
			extraValue,
			comment,
		})
		console.log(res)
		Alert.alert('기록 완료', '고생하셨습니다!', [
			{
				text: '확인',
				onPress: () => {
					navigation.pop()
				},
			},
		])
	}

	return (
		<View
			style={css`
				flex: 1;
			`}
		>
			<KeyboardAwareScrollView
				onLayout={onLayout}
				style={css`
					flex: 1;
				`}
			>
				<View
					style={[
						css`
							flex: 1;
							padding: 40px 20px;
							justify-content: space-between;
						`,
						{
							minHeight: layout?.height ?? 0,
						},
					]}
				>
					<View
						style={css`
							align-items: center;
							justify-content: center;
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
							고생하셨습니다!
						</Text>
						<View
							style={css`
								margin-top: 24px;
								background: #fff;
								width: 300px;
								height: 300px;
								border-radius: 150px;
								border: solid ${COLOR.BRAND(200)} 20px;
								align-items: center;
								justify-content: center;
							`}
						>
							<Text
								style={css`
									font-family: ${FONT.SPOQA('BOLD')};
									font-size: 42px;
									color: ${COLOR.BRAND(300)};
								`}
							>
								{route.params.workoutType.detailedName}
							</Text>
							<Text
								style={css`
									font-family: ${FONT.SPOQA('BOLD')};
									font-size: 24px;
									color: ${COLOR.BRAND(200)};
								`}
							>
								{Math.floor(route.params.duration / 60)}분{' '}
								{Math.floor(route.params.duration % 60)}초
							</Text>
						</View>
						{route.params.workoutType.id === 'run' && (
							<View
								style={css`
									margin-top: 24px;

									border-radius: 12px;
									background: ${COLOR.BRAND(200)};
									padding: 12px;

									flex-direction: row;
									align-items: center;
									justify-content: space-between;
								`}
							>
								<TextInput
									style={css`
										flex: 1;
										font-size: 24px;
										color: #fff;
									`}
									placeholderTextColor={COLOR.BRAND(100)}
									placeholder="운동량을 입력해 주세요"
									keyboardType="numeric"
									value={value}
									onChangeText={(text) => setValue(text)}
								/>
								<Text
									style={css`
										margin-left: 4px;
										font-size: 24px;
										color: #fff;
									`}
								>
									KM
								</Text>
							</View>
						)}
						{(route.params.workoutType.id === 'pushup' ||
							route.params.workoutType.id === 'situp') && (
							<View
								style={css`
									margin-top: 24px;

									border-radius: 12px;
									background: ${COLOR.BRAND(200)};
									padding: 12px;

									flex-direction: row;
									align-items: center;
									justify-content: space-between;
								`}
							>
								<TextInput
									style={css`
										flex: 1;
										font-size: 24px;
										color: #fff;
									`}
									placeholderTextColor={COLOR.BRAND(100)}
									placeholder="운동량을 입력해 주세요"
									keyboardType="number-pad"
									value={value}
									onChangeText={(text) => setValue(text)}
								/>
								<Text
									style={css`
										margin-left: 4px;
										font-size: 24px;
										color: #fff;
									`}
								>
									개
								</Text>
							</View>
						)}
						<View
							style={css`
								margin-top: 24px;

								border-radius: 12px;
								background: ${COLOR.BRAND(200)};
								padding: 12px;

								flex-direction: row;
								align-items: center;
								justify-content: space-between;
							`}
						>
							<TextInput
								style={css`
									flex: 1;
									font-size: 24px;
									color: #fff;
								`}
								placeholderTextColor={COLOR.BRAND(100)}
								placeholder="노트를 남겨주세요"
								value={comment}
								onChangeText={(text) => setComment(text)}
							/>
						</View>
					</View>
				</View>
			</KeyboardAwareScrollView>
			<View
				style={css`
					background: #fff;
					padding: 20px;
					padding-bottom: 40px;
				`}
			>
				<Button
					backgroundColor={COLOR.BRAND(300)}
					disabled={!value}
					onPress={() => onSubmit()}
				>
					<Text
						style={css`
							font-family: ${FONT.ROKA};
							font-size: 24px;
							color: #fff;
						`}
					>
						기록하기
					</Text>
				</Button>
			</View>
		</View>
	)
}

export default WorkoutResultScreen
