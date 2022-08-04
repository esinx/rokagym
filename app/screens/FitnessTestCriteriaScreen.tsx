import { css } from '@emotion/native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useCallback, useMemo } from 'react'
import { Text, View } from 'react-native'
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view'
import { PressableOpacity } from 'react-native-pressable-opacity'

import { RootStackParamList } from '@/App'
import AsyncBoundary from '@/components/AsyncBoundary'
import ErrorBox from '@/components/ErrorBox'
import FocusAwareStatusBar from '@/components/FocusAwareStatusBar'
import Spinner from '@/components/Spinner'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import getKoreanAgeFromBirthday from '@/utils/korean-age'
import { rangeContains } from '@/utils/range'
import { InferQueryOutput, trpc } from '@/utils/trpc'

type FitnessTestData =
	InferQueryOutput<'opendata.getFitnessTestData'> extends Array<infer T>
		? T
		: never

const FitnessTestDataRow: React.FC<{
	data: FitnessTestData
}> = ({ data }) => (
	<View
		style={css`
			margin-bottom: 20px;
			padding: 12px;
			background: #fff;
			border-radius: 12px;

			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		`}
	>
		<Text
			style={css`
				font-family: ${FONT.SPOQA('BOLD')};
				font-size: 24px;
			`}
		>
			{data.range[0]} ~ {data.range[1]}
		</Text>
		<View
			style={css`
				align-items: flex-end;
			`}
		>
			<Text
				style={css`
					font-family: ${FONT.SPOQA('BOLD')};
					color: ${COLOR.BRAND(200)};
					font-size: 18px;
				`}
			>
				{data.grade}
			</Text>
			<Text
				style={css`
					color: ${COLOR.GRAY(300)};
					font-size: 12px;
				`}
			>
				{`${data.ageRange[0] || ''} ~ ${data.ageRange[1]}세 기준`}
			</Text>
		</View>
	</View>
)

const GRADE_ORDER = ['특급', '1급', '2급', '3급', '무급']
const sortByGrade = (a: FitnessTestData, b: FitnessTestData) => {
	return GRADE_ORDER.indexOf(a.grade) - GRADE_ORDER.indexOf(b.grade)
}

const groupAgeFitnessTestData = (age: number) => (data: FitnessTestData[]) => {
	const grouped = Object.entries(
		data.reduce<Record<string, FitnessTestData[]>>((acc, cur) => {
			const key = cur.ageRange.join('-')
			const previousValue = acc[key] ?? []
			return {
				...acc,
				[key]: [...previousValue, cur],
			}
		}, {}),
	)

	const [myAgeRangeKey, myAgeRange] = grouped.find(([key, value]) =>
		rangeContains(value[0].ageRange, age),
	)!
	const notMyAgeRange = grouped
		.filter(([key, value]) => key !== myAgeRangeKey)
		.flatMap(([key, value]) => value)

	return [...myAgeRange.sort(sortByGrade), ...notMyAgeRange.sort(sortByGrade)]
}

type StringTuple = [string, string]

const FitnessTestDataTab: React.FC = () => {
	const fitnessQuery = trpc.useQuery(['opendata.getFitnessTestData'])
	const profileQuery = trpc.useQuery(['user.profile'])
	if (!fitnessQuery.data || !profileQuery.data) return null

	const koreanAge = getKoreanAgeFromBirthday(profileQuery.data.birthday)
	const processedData = useMemo(
		() =>
			fitnessQuery.data.map(({ range, ...rest }) => ({
				...rest,
				range: (() => {
					switch (rest.type) {
						case '3km-run':
							return (
								range[1] === '00:01'
									? ['00:00', range[0]]
									: range[1] === '180:00'
									? [range[0], '']
									: range
							) as StringTuple
						case '2m-pushup':
						case '2m-curlup':
							return (
								range[1] === '999' ? [range[0], ''] : range
							) as StringTuple
					}
					return range
				})(),
			})),
		[fitnessQuery.data],
	)
	const TABS = useMemo(() => {
		const groupData = groupAgeFitnessTestData(koreanAge)
		return [
			{
				name: '뜀걸음(3km)',
				data: groupData(processedData.filter(({ type }) => type === '3km-run')),
			},

			{
				name: '윗몸일으켜기(2분)',
				data: groupData(
					processedData.filter(({ type }) => type === '2m-curlup'),
				),
			},

			{
				name: '팔굽혀펴기(2분)',
				data: groupData(
					processedData.filter(({ type }) => type === '2m-pushup'),
				),
			},
		]
	}, [processedData, koreanAge])

	return (
		<Tabs.Container
			renderHeader={() => (
				<View
					style={css`
						align-items: center;
						justify-content: center;
						padding: 20px;
					`}
				>
					<Text
						style={css`
							font-family: ROKA;
							color: #ccc;
							font-size: 24px;
						`}
					>
						나의 현재 등급
					</Text>
					<Text
						style={css`
							font-family: ROKA;
							font-size: 32px;
						`}
					>
						{profileQuery.data
							? `${getKoreanAgeFromBirthday(
									profileQuery.data?.birthday,
							  )}세 기준`
							: ''}
					</Text>
					<View
						style={css`
							flex-direction: row;
							align-items: flex-start;
						`}
					>
						<Text
							style={css`
								font-family: SpoqaHanSansNeoBold;
								color: ${COLOR.BRAND('main')};
								font-size: 64px;
								line-height: 72px;
							`}
						>
							-급
						</Text>
					</View>
				</View>
			)}
			headerContainerStyle={css`
				shadow-opacity: 0;
			`}
			renderTabBar={(props) => (
				<MaterialTabBar
					{...props}
					keepActiveTabCentered
					scrollEnabled
					activeColor={COLOR.BRAND('main')}
					labelStyle={css`
						font-family: SpoqaHanSansNeoBold;
						font-weight: 700;
						font-size: 16px;
					`}
					indicatorStyle={css`
						height: 3px;
						border-radius: 3px;
						background: ${COLOR.BRAND('main')};
					`}
					contentContainerStyle={css`
						padding: 0 20px;
					`}
				/>
			)}
		>
			{TABS.map(({ name, data }, tabIndex) => (
				<Tabs.Tab name={name} key={tabIndex}>
					<Tabs.FlatList
						data={data ?? []}
						style={css`
							background: ${COLOR.GRAY(50)};
						`}
						contentContainerStyle={css`
							padding: 20px;
						`}
						renderItem={({ index, item }) => (
							<FitnessTestDataRow data={item} key={index} />
						)}
						keyExtractor={(_, index) => String(index)}
					/>
				</Tabs.Tab>
			))}
		</Tabs.Container>
	)
}

const FitnessTestCriteriaScreen = () => {
	const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
	useFocusEffect(
		useCallback(() => {
			navigation.setOptions({
				headerLeft: () => null,
				headerRight: () => (
					<PressableOpacity onPress={() => navigation.pop()}>
						<Text
							style={css`
								font-size: 16px;
								color: ${COLOR.BRAND('main')};
							`}
						>
							닫기
						</Text>
					</PressableOpacity>
				),
				headerRightContainerStyle: {
					paddingRight: 12,
				},
				title: '체력검정 기준',
			})
		}, []),
	)
	return (
		<>
			<View
				style={css`
					flex: 1;
					justify-content: space-between;
					background: ${COLOR.GRAY(50)};
				`}
			>
				<AsyncBoundary
					ErrorFallback={({ error }) => {
						return (
							<ErrorBox
								errorText="로딩 중 오류가 발생했습니다"
								errorCode={error.message}
							/>
						)
					}}
					SuspenseFallback={
						<View
							style={css`
								flex: 1;
								align-items: center;
								justify-content: center;
							`}
						>
							<Spinner />
						</View>
					}
				>
					<FitnessTestDataTab />
				</AsyncBoundary>
			</View>
			<FocusAwareStatusBar style="light" />
		</>
	)
}

export default FitnessTestCriteriaScreen
