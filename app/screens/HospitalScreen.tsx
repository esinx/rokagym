import { css } from '@emotion/native'
import { Entypo } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useCallback, useMemo } from 'react'
import { FlatList, Text, View } from 'react-native'
import { Linking } from 'react-native'
import { PressableOpacity } from 'react-native-pressable-opacity'

import { RootStackParamList } from '@/App'
import AsyncBoundary from '@/components/AsyncBoundary'
import ErrorBox from '@/components/ErrorBox'
import FocusAwareStatusBar from '@/components/FocusAwareStatusBar'
import PressableHighlight from '@/components/PressableHighlight'
import Spinner from '@/components/Spinner'
import { LocationStatus, useLocation } from '@/hooks/use-location'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import { coordinateDistances } from '@/utils/geo-coords'
import { InferQueryOutput, trpc } from '@/utils/trpc'

type HospitalData = (InferQueryOutput<'opendata.getHospitalData'> extends Array<
	infer T
>
	? T
	: never) & {
	distance?: number
}

const HospitalDataRow: React.FC<{
	data: HospitalData
}> = ({ data }) => (
	<PressableHighlight
		color="#fff"
		onPress={() => Linking.openURL(`tel:${data.contact}`)}
		style={css`
			margin-bottom: 20px;
			padding: 12px;
			border-radius: 12px;

			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		`}
	>
		<View
			style={css`
				flex: 1;
				align-items: flex-start;
			`}
		>
			<Text
				style={css`
					font-family: ${FONT.SPOQA('BOLD')};
					font-size: 18px;
				`}
			>
				{data.name}
			</Text>
			<Text
				style={css`
					color: ${COLOR.GRAY(300)};
					font-size: 12px;
				`}
			>
				{data.address}
			</Text>
			<View
				style={css`
					flex-direction: row;
					justify-content: space-between;
					align-items: center;
				`}
			>
				<Entypo name="old-phone" size={18} color={COLOR.BRAND(200)} />
				<Text
					style={css`
						margin-left: 4px;
						font-size: 14px;
						height: 14px;
					`}
				>
					{data.contact}
				</Text>
			</View>
		</View>
		<View
			style={css`
				margin-left: 12px;
				align-items: flex-end;
			`}
		>
			{data.distance && (
				<Text
					style={css`
						font-family: ${FONT.SPOQA('BOLD')};
						color: ${COLOR.BRAND(200)};
						font-size: 18px;
					`}
				>
					{Math.round(data.distance)}km
				</Text>
			)}
		</View>
	</PressableHighlight>
)

const HospitalDataList: React.FC = () => {
	const hospitalQuery = trpc.useQuery(['opendata.getHospitalData'])
	const { location, status, refreshLocation } = useLocation()

	useFocusEffect(
		useCallback(() => {
			refreshLocation()
		}, []),
	)

	const displayData = useMemo(() => {
		const data = hospitalQuery.data ?? []
		if (status === LocationStatus.Resolved && location) {
			const withLocationData = data.map((d) => ({
				...d,
				distance: coordinateDistances(d.coordinates, location.coords),
			}))
			withLocationData.sort((a, b) => a.distance - b.distance)
			return withLocationData
		}
		return data
	}, [hospitalQuery.data, location, status])

	return (
		<FlatList
			contentContainerStyle={css`
				padding: 20px;
			`}
			ListHeaderComponent={() => (
				<Text
					style={css`
						color: ${COLOR.GRAY(400)};
					`}
				>
					무리한 체력단련 중 위급한 환자가 발생한 경우, 아래 병원 중 가장 가까운
					곳으로 연락하여 조치받으세요.
					{'\n\n'}
					병원 이름을 탭하면 즉시 전화로 연결됩니다.
				</Text>
			)}
			ListHeaderComponentStyle={css`
				margin-bottom: 20px;
			`}
			data={displayData}
			renderItem={({ item }) => <HospitalDataRow data={item} />}
			keyExtractor={({ name }) => name}
		/>
	)
}

const HospitalScreen: React.FC = () => {
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
				title: '인근 군병원 주소 및 연락처',
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
					<HospitalDataList />
				</AsyncBoundary>
			</View>
			<FocusAwareStatusBar style="light" />
		</>
	)
}

export default HospitalScreen
