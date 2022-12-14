import { css } from '@emotion/native'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { SafeAreaView, Text } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { z } from 'zod'

import { RootStackParamList } from '@/App'
import Controlled from '@/components/controlled'
import FocusAwareStatusBar from '@/components/FocusAwareStatusBar'
import PlainNavigationBar from '@/components/PlainNavigationBar'
import PressableHighlight from '@/components/PressableHighlight'
import RGDatePicker from '@/components/RGDateInput'
import Spacer from '@/components/Spacer'
import { accessTokenAtom, refreshTokenAtom } from '@/store/atoms/token'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import { RANKS } from '@/utils/ranks'
import { InferQueryOutput, trpc } from '@/utils/trpc'

type Base = InferQueryOutput<'base.baseLookup'> extends (infer E)[] ? E : never

type Props = StackScreenProps<RootStackParamList, 'Login'>

const formSchema = z
	.object({
		name: z.string().min(1, '이름을 입력해주세요'),
		birthday: z.date(),
		sex: z.enum(['MALE', 'FEMALE']),
		rank: z.string(),
		baseId: z.string(),
		email: z.string().email('이메일 형식을 확인해 주세요'),
		password: z.string().min(8, '비밀번호는 8자리 이상으로 만들어주세요.'),
		confirmPassword: z
			.string()
			.min(8, '비밀번호는 8자리 이상으로 만들어주세요.'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: '비밀번호가 정확한지 확인해주세요!',
		path: ['confirmPassword'],
	})

type FieldValues = z.infer<typeof formSchema>

const SignupScreen: React.FC<Props> = ({ navigation, route }) => {
	const {
		register,
		handleSubmit,
		control,
		formState: { isValid, errors },
		...form
	} = useForm<FieldValues>({
		resolver: zodResolver(formSchema),
		mode: 'all',
		reValidateMode: 'onChange',
		defaultValues: {
			email: '',
			password: '',
			confirmPassword: '',
		},
	})

	const [selectedBase, setSelectedBase] = useState<Base>()

	const { client } = trpc.useContext()

	const createUserMutation = trpc.useMutation(['user.createUser'])
	const createBaseMutation = trpc.useMutation(['base.createBase'])

	const setRefreshToken = useSetAtom(refreshTokenAtom)
	const setAccessToken = useSetAtom(accessTokenAtom)

	const onSubmit = useCallback<SubmitHandler<FieldValues>>(
		async ({ email, password, baseId, birthday, name, rank, sex }) => {
			try {
				const data = await createUserMutation.mutateAsync({
					email,
					password,
					baseId,
					birthday: new Date(birthday),
					name,
					rank,
					sex,
				})
				navigation.pop()
				setImmediate(() => {
					setRefreshToken(data.refreshToken)
					setAccessToken(data.accessToken)
				})
			} catch (error) {
				console.error(error)
			}
		},
		[createUserMutation, setRefreshToken, setAccessToken],
	)

	useFocusEffect(
		useCallback(() => {
			navigation.setOptions({
				headerShown: false,
				gestureEnabled: !route.params.trap,
			})
		}, [navigation, route.params.trap]),
	)

	useEffect(() => {
		const baseId = form.getValues('baseId')
		if (!baseId) return
		client
			.query('base.getBaseById', {
				id: baseId,
			})
			.then((base) => base && setSelectedBase(base))
	}, [form.watch('baseId')])

	console.log({ values: form.getValues(), errors, isValid })

	return (
		<SafeAreaView
			style={css`
				flex: 1;
			`}
		>
			<KeyboardAwareScrollView
				style={css`
					flex: 1;
					padding: 40px 20px;
				`}
				contentInset={{
					bottom: 64,
				}}
			>
				<PlainNavigationBar
					withoutInsets
					style={css`
						padding: 12px 0;
					`}
				/>
				<Text
					style={css`
						font-family: ${FONT.SPOQA('BOLD')};
						font-size: 48px;
					`}
				>
					가입하기
				</Text>
				<Text
					style={css`
						color: ${COLOR.GRAY(400)};
						line-height: 24px;
					`}
				>
					장병 여러분들의 꾸준한 체력단련을 응원합니다!{'\n'}가입하기 위해 아래
					정보를 기입해주세요.
				</Text>
				<Spacer y={24} />
				<Controlled.RGTextInput
					label="이름"
					placeholder="이름을 입력해주세요"
					name="name"
					control={control}
					error={errors.name?.message}
				/>
				<Spacer y={16} />
				<Controlled.RGTextInput
					label="이메일"
					placeholder="someone@mail.com"
					name="email"
					keyboardType="email-address"
					autoCapitalize="none"
					control={control}
					error={errors.email?.message}
				/>
				<Spacer y={16} />
				<Controlled.RGTextInput
					label="비밀번호"
					placeholder="••••••••"
					name="password"
					control={control}
					secureTextEntry
					error={errors.password?.message}
				/>
				<Spacer y={16} />
				<Controlled.RGTextInput
					label="비밀번호 확인"
					placeholder="••••••••"
					name="confirmPassword"
					control={control}
					secureTextEntry
					error={errors.confirmPassword?.message}
				/>
				<Spacer y={16} />
				<RGDatePicker
					date={form.watch('birthday')}
					onConfirm={(date) =>
						form.setValue('birthday', date, {
							shouldValidate: true,
						})
					}
					label="생년월일"
					placeholder="생년월일을 입력해주세요"
				/>
				<Spacer y={16} />
				<Controlled.RGDropDown
					name="sex"
					control={control}
					labelField="label"
					valueField="value"
					placeholder="성별 선택"
					data={[
						{
							label: '남성',
							value: 'MALE',
						},
						{
							label: '여성',
							value: 'FEMALE',
						},
					]}
					keyboardAvoiding
					dropdownPosition="top"
				/>
				<Spacer y={16} />
				<Controlled.RGDropDown
					name="rank"
					control={control}
					labelField="label"
					valueField="value"
					placeholder="계급 선택"
					data={RANKS.map((s) => ({
						label: s,
						value: s,
					}))}
					keyboardAvoiding
					dropdownPosition="top"
				/>
				<Spacer y={16} />
				<PressableHighlight
					onPress={() =>
						navigation.navigate('SelectBase', {
							callback: async (base) => {
								let id = base.id
								if (!id) {
									const { group, name, inferredUnitCode } = base
									const res = await createBaseMutation.mutateAsync({
										group,
										name,
										// type fuckup fix
										inferredUnitCode:
											typeof inferredUnitCode === 'string'
												? inferredUnitCode
												: undefined,
									})
									id = res.id
								}
								form.setValue('baseId', id, {
									shouldValidate: true,
								})
							},
						})
					}
					style={css`
						background: ${COLOR.GRAY(50)};
						padding: 18px 10px;
						border-radius: 8px;
					`}
				>
					<Text
						style={css`
							font-size: 16px;
							color: ${selectedBase?.name ? COLOR.GRAY(900) : COLOR.GRAY(300)};
						`}
					>
						{selectedBase?.name ?? '부대를 선택해주세요'}
					</Text>
				</PressableHighlight>
				<Spacer y={16} />
				<PressableHighlight
					disabled={!isValid}
					color={isValid ? COLOR.BRAND(200) : COLOR.GRAY(200)}
					style={css`
						padding: 20px;
						border-radius: 12px;
						align-items: center;
					`}
					onPress={handleSubmit(onSubmit)}
				>
					<Text
						style={css`
							color: #fff;
							font-size: 18px;
							font-family: ${FONT.SPOQA('BOLD')};
						`}
					>
						가입하기
					</Text>
				</PressableHighlight>
			</KeyboardAwareScrollView>
			<FocusAwareStatusBar style="light" />
		</SafeAreaView>
	)
}

export default SignupScreen
