import { css } from '@emotion/native'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { SafeAreaView, Text, View } from 'react-native'
import { z } from 'zod'

import { RootStackParamList } from '@/App'
import Button from '@/components/Button'
import Controlled from '@/components/controlled'
import Spacer from '@/components/Spacer'
import { accessTokenAtom, refreshTokenAtom } from '@/store/atoms/token'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import { trpc } from '@/utils/trpc'

type Props = StackScreenProps<RootStackParamList, 'Login'>

const formSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
})

type FieldValues = z.infer<typeof formSchema>

const LoginScreen: React.FC<Props> = ({ navigation, route }) => {
	const {
		register,
		handleSubmit,
		control,
		formState: { isValid },
		...form
	} = useForm<FieldValues>({
		resolver: zodResolver(formSchema),
		mode: 'onChange',
		defaultValues: {
			email: '',
			password: '',
		},
	})

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
			if (route.params.trap) {
				navigation.setOptions({
					headerShown: false,
					gestureEnabled: false,
				})
			}
		}, [navigation, route.params.trap]),
	)

	return (
		<SafeAreaView
			style={css`
				flex: 1;
			`}
		>
			<View
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
					환영합니다!
				</Text>
				<Spacer y={48} />
				<Controlled.RGTextInput
					placeholder="이메일"
					name="email"
					control={control}
				/>
				<Spacer y={24} />
				<Controlled.RGTextInput
					placeholder="비밀번호"
					name="password"
					control={control}
					secureTextEntry
				/>
				<Spacer y={24} />
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
						로그인
					</Text>
				</Button>
			</View>
		</SafeAreaView>
	)
}

export default LoginScreen
