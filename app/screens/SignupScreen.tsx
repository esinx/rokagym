import { css } from '@emotion/native'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { SafeAreaView, Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { z } from 'zod'

import { RootStackParamList } from '@/App'
import Button from '@/components/Button'
import Controlled from '@/components/controlled'
import FocusAwareStatusBar from '@/components/FocusAwareStatusBar'
import RGDatePicker from '@/components/RGDateInput'
import RGDropDown from '@/components/RGDropDown'
import Spacer from '@/components/Spacer'
import { accessTokenAtom, refreshTokenAtom } from '@/store/atoms/token'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import { InferQueryOutput, trpc } from '@/utils/trpc'

type Base = InferQueryOutput<'base.baseLookup'> extends (infer E)[] ? E : never

const RANKS = [
	'이등병',
	'일병',
	'상병',
	'병장',
	'하사',
	'중사',
	'상사',
	'원사',
	'준위',
	'소위',
	'중위',
	'대위',
	'소령',
	'중령',
	'대령',
	'준장',
	'소장',
	'중장',
	'대장',
]

type Props = StackScreenProps<RootStackParamList, 'Login'>

const formSchema = z
	.object({
		name: z.string().min(1, '이름을 입력해주세요'),
		birthday: z.date(),
		sex: z.enum(['MALE', 'FEMALE', 'NONBINARY']),
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
		mode: 'onChange',
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
	const loginMutation = trpc.useMutation(['user.login'])
	const setRefreshToken = useSetAtom(refreshTokenAtom)
	const setAccessToken = useSetAtom(accessTokenAtom)

	const onSubmit = useCallback<SubmitHandler<FieldValues>>(
		async ({ email, password }) => {
			try {
				const data = await loginMutation.mutateAsync({
					email,
					password,
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
		[loginMutation, setRefreshToken, setAccessToken],
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
			>
				<Text
					style={css`
						font-family: ${FONT.SPOQA('BOLD')};
						font-size: 48px;
					`}
				>
					가입하기
				</Text>
				<Spacer y={48} />
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
				<RGDatePicker label="생년월일" />
				<Spacer y={16} />
				<RGDropDown
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
				<View
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
				</View>
				<Spacer y={8} />
				<Button
					backgroundColor={COLOR.BRAND(300)}
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
								form.setValue('baseId', id)
							},
						})
					}
				>
					<Text
						style={css`
							color: #fff;
						`}
					>
						부대 선택하기
					</Text>
				</Button>

				<Spacer y={16} />
				<Button
					disabled={!isValid}
					backgroundColor={COLOR.BRAND(300)}
					onPress={handleSubmit(onSubmit)}
				>
					<Text
						style={css`
							color: #fff;
						`}
					>
						가입하기
					</Text>
				</Button>
			</KeyboardAwareScrollView>
			<FocusAwareStatusBar style="light" />
		</SafeAreaView>
	)
}

export default SignupScreen
