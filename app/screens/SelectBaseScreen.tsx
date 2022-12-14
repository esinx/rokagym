import { css } from '@emotion/native'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { FlatList, Text, View } from 'react-native'
import { z } from 'zod'

import { RootStackParamList } from '@/App'
import Button from '@/components/Button'
import Controlled from '@/components/controlled'
import FocusAwareStatusBar from '@/components/FocusAwareStatusBar'
import PressableHighlight from '@/components/PressableHighlight'
import Spinner from '@/components/Spinner'
import COLOR from '@/utils/colors'
import { InferQueryInput, InferQueryOutput, trpc } from '@/utils/trpc'

type Props = StackScreenProps<RootStackParamList, 'SelectBase'>

type GroupType = InferQueryInput<'base.baseLookup'>['group']
type Base = InferQueryOutput<'base.baseLookup'> extends (infer E)[] ? E : never

const formSchema = z.object({
	group: z.string(),
	query: z.string().min(1),
})

type FieldValues = z.infer<typeof formSchema>

const BaseEntry: React.FC<{
	base: Base
	onPress?: (base: Base) => void
}> = ({ base, onPress }) => (
	<PressableHighlight
		color="#FFF"
		highlightColor={COLOR.BRAND(100)}
		style={css`
			padding: 16px;
			border-radius: 8px;
		`}
		onPress={() => onPress?.(base)}
	>
		<Text
			style={css`
				font-size: 18px;
			`}
		>
			{base.name}
		</Text>
	</PressableHighlight>
)

const SelectBaseScreen: React.FC<Props> = ({ navigation, route }) => {
	const { client } = trpc.useContext()
	const [searchResults, setSearchResults] = useState<Base[]>([])
	const [isSearching, setIsSearching] = useState(false)

	const {
		register,
		handleSubmit,
		control,
		formState: { isValid, isSubmitting, isSubmitted },
		...form
	} = useForm<FieldValues>({
		resolver: zodResolver(formSchema),
		mode: 'onChange',
		defaultValues: {
			group: 'ARMY',
			query: '',
		},
	})

	useFocusEffect(
		useCallback(() => {
			navigation.setOptions({
				//headerShown: false,
			})
		}, []),
	)

	const search = useCallback(
		async (query: string, group: GroupType) =>
			client.query('base.baseLookup', {
				query,
				group,
			}),
		[client],
	)

	const onSubmit = useCallback<SubmitHandler<FieldValues>>(
		async ({ group, query }) => {
			console.log({ group, query })
			setIsSearching(true)
			try {
				const res = await search(query, group as unknown as GroupType)
				setSearchResults(res)
			} catch (error) {
			} finally {
				setIsSearching(false)
			}
		},
		[setSearchResults, search],
	)

	const handlePress = useCallback(
		(base: Base) => {
			route.params.callback?.(base)
			navigation.pop()
		},
		[route.params.callback],
	)

	return (
		<View
			style={css`
				flex: 1;
			`}
		>
			<View
				style={css`
					padding: 20px;
				`}
			>
				<Controlled.RGDropDown
					control={control}
					name="group"
					data={[
						{ label: '??????', value: 'ARMY' },
						{ label: '??????', value: 'NAVY' },
						{ label: '??????', value: 'AIR_FORCE' },
						{ label: '?????????', value: 'MARINE_CORPS' },
						{ label: '?????????', value: 'MINISTRY_OF_DEFENSE' },
					]}
				/>
				<View
					style={css`
						margin-top: 8px;
						flex-direction: row;
						justify-content: space-between;
					`}
				>
					<Controlled.RGTextInput
						placeholder="??????????????? ??????"
						clearButtonMode="unless-editing"
						control={control}
						name="query"
						style={css`
							flex: 1;
						`}
						onKeyPress={(e) => {
							if (e.nativeEvent.key === 'Enter' && isValid) {
								handleSubmit(onSubmit)()
							}
						}}
					/>
					<Button
						dismissKeyboardOnPress
						backgroundColor={COLOR.BRAND(300)}
						disabled={!isValid}
						onPress={handleSubmit(onSubmit)}
						style={css`
							margin-left: 8px;
							padding: 10px 20px;
						`}
					>
						<Text
							style={css`
								color: #fff;
							`}
						>
							??????
						</Text>
					</Button>
				</View>
			</View>
			<FlatList
				data={searchResults}
				contentContainerStyle={css`
					flex-grow: 1;
				`}
				style={css`
					padding: 30px 16px;
					background: ${COLOR.GRAY(100)};
				`}
				contentInset={{ bottom: 30 }}
				contentInsetAdjustmentBehavior="always"
				ItemSeparatorComponent={() => (
					<View
						style={css`
							height: 8px;
						`}
					/>
				)}
				renderItem={({ item }) => (
					<BaseEntry base={item} onPress={handlePress} />
				)}
				keyExtractor={(item, idx) =>
					item.id ?? item.inferredUnitCode ?? String(idx)
				}
				ListEmptyComponent={() => (
					<View
						style={css`
							flex: 1;
							justify-content: center;
							align-items: center;
						`}
					>
						{isSearching ? (
							<Spinner />
						) : (
							<Text
								style={css`
									color: ${COLOR.GRAY(400)};
								`}
							>
								{isSubmitted
									? '?????? ????????? ????????????.'
									: '???????????? ??????????????????.'}
							</Text>
						)}
					</View>
				)}
			/>
			<FocusAwareStatusBar style="light" />
		</View>
	)
}

export default SelectBaseScreen
