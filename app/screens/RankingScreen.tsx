import { css } from '@emotion/native'
import { useFocusEffect } from '@react-navigation/native'
import { DateTime } from 'luxon'
import React, { useCallback, useState } from 'react'
import { RefreshControl, SafeAreaView, Text, View } from 'react-native'
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view'

import AsyncBoundary from '@/components/AsyncBoundary'
import ErrorBox from '@/components/ErrorBox'
import FocusAwareStatusBar from '@/components/FocusAwareStatusBar'
import RGRadioInput from '@/components/RGRadioInput'
import Spinner from '@/components/Spinner'
import { secondsToTimestamp } from '@/utils'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import getGroupNameFromCode from '@/utils/group-name'
import { InferQueryOutput, trpc } from '@/utils/trpc'
import { ArrayElement } from '@/utils/types'
import { workoutTypeToUnit } from '@/utils/unit'

const RankingView: React.FC<{ id: string }> = ({ id }) => {
	const rankingQuery = trpc.useQuery([
		'ranking.getRanking',
		{
			id,
		},
	])
	const response = rankingQuery.data
	if (!response)
		return (
			<View
				style={css`
					flex: 1;
					justify-content: center;
					align-items: center;
				`}
			>
				<Spinner />
			</View>
		)
	return (
		<Tabs.FlatList
			onRefresh={() => rankingQuery.refetch()}
			refreshing={rankingQuery.isRefetching}
			data={response.data}
			contentContainerStyle={css`
				padding: 20px;
			`}
			ListHeaderComponent={() => (
				<View
					style={css`
						margin-bottom: 12px;
					`}
				>
					<Text
						style={css`
							font-size: 12px;
							color: ${COLOR.GRAY(400)};
						`}
					>
						기준:{' '}
						{DateTime.fromMillis(response.createdAt)
							.setZone('Asia/Seoul')
							.toFormat('yyyy년 M월 d일 HH시 mm분')}
					</Text>
				</View>
			)}
			renderItem={({ item, index }) => (
				<View
					style={css`
						background: ${COLOR.GRAY(50)};
						padding: 8px;
						border-radius: 8px;
						flex-direction: row;
						justify-content: space-between;
						align-items: center;
						margin-bottom: 8px;
					`}
				>
					<View
						style={css`
							flex: 1;
							flex-direction: row;
							align-items: center;
							justify-content: flex-start;
						`}
					>
						<View
							style={css`
								flex-grow: 0;
								flex-shrink: 0;
								flex-basis: 50px;
								width: 50px;
							`}
						>
							<Text
								style={css`
									font-family: ${FONT.SPOQA('BOLD')};
									font-size: 24px;
									color: ${COLOR.BRAND(200)};
								`}
							>
								#{index + 1}
							</Text>
						</View>
						<View
							style={css`
								margin-left: 8px;
							`}
						>
							<Text
								style={css`
									font-size: 12px;
									color: ${COLOR.GRAY(400)};
								`}
							>
								{getGroupNameFromCode(item.group as unknown as any, true)}
								{' \u003E '}
								{item.basename}
							</Text>
							<Text
								style={css`
									font-family: ${FONT.SPOQA('BOLD')};
									font-size: 20px;
									color: ${COLOR.GRAY(900)};
								`}
							>
								{item.rank} {item.username}
							</Text>
						</View>
					</View>
					<View
						style={css`
							margin-left: 4px;
						`}
					>
						<Text
							style={css`
								font-family: ${FONT.SPOQA('BOLD')};
								font-size: 20px;
								color: ${COLOR.BRAND(200)};
							`}
						>
							{item.value}
							{workoutTypeToUnit(id.split('.')[1] ?? '')}
						</Text>
					</View>
				</View>
			)}
		/>
	)
}

const SuspendedRankingView: React.FC<
	React.ComponentProps<typeof RankingView>
> = (props) => (
	<AsyncBoundary
		ErrorFallback={({ error }) => {
			return (
				<View
					style={css`
						padding: 40px;
					`}
				>
					<ErrorBox
						errorText="랭킹 로딩 중 오류가 발생했습니다!"
						errorCode={error.message}
					/>
				</View>
			)
		}}
		SuspenseFallback={
			<View
				style={css`
					flex: 1;
					justify-content: center;
					align-items: center;
				`}
			>
				<Spinner />
			</View>
		}
	>
		<RankingView {...props} />
	</AsyncBoundary>
)

const Bar: React.FC<{
	data: ArrayElement<InferQueryOutput<'workout.hallOfFame'>['3km-run']>
	index: number
	color: string
}> = ({ color, index, data }) => (
	<View
		style={[
			css`
				background: ${color ?? COLOR.BRAND(200)};
				border-top-left-radius: 12px;
				border-top-right-radius: 12px;
				border-bottom-left-radius: 0;
				border-bottom-right-radius: 0;
				width: 120px;
				padding: 8px;

				justify-content: space-between;
			`,
			{
				height: (3 - index) * 40 + 120,
			},
		]}
	>
		<View>
			<Text
				style={css`
					font-family: ${FONT.ROKA};
					font-size: 28px;
					color: #fff;
				`}
			>
				#{index + 1}
			</Text>
			<Text
				style={css`
					font-family: ${FONT.SPOQA('BOLD')};
					font-size: 20px;
					color: #fff;
				`}
			>
				{data.type.id === '3km-run'
					? secondsToTimestamp(data.value)
					: data.value}
				{workoutTypeToUnit(data.type.id)}
			</Text>
		</View>
		<View>
			<Text
				style={css`
					font-family: ${FONT.SPOQA('BOLD')};
					font-size: 12px;
					color: #ffffff88;
				`}
			>
				{getGroupNameFromCode(data.user.base.group, true)}
			</Text>

			<Text
				style={css`
					font-family: ${FONT.SPOQA('BOLD')};
					font-size: 12px;
					color: #ffffffaa;
				`}
			>
				{data.user.base.name}
			</Text>
			<Text
				style={css`
					font-family: ${FONT.ROKA};
					font-size: 20px;
					color: #ffffffcc;
				`}
			>
				{data.user.rank}
			</Text>
			<Text
				style={css`
					font-family: ${FONT.ROKA};
					font-size: 20px;
					color: #fff;
				`}
			>
				{data.user.name}
			</Text>
		</View>
	</View>
)

const HallOfFameView: React.FC = () => {
	const hallOfFameQuery = trpc.useQuery(['workout.hallOfFame'])
	const [isPullToRefresh, setIsPullToRefresh] = useState(false)
	useFocusEffect(
		useCallback(() => {
			setIsPullToRefresh(false)
			hallOfFameQuery.refetch()
		}, []),
	)
	if (!hallOfFameQuery.data) return null

	const {
		'3km-run': run,
		'2m-situp': situp,
		'2m-pushup': pushup,
	} = hallOfFameQuery.data

	return (
		/* @ts-ignore-next-line */
		<Tabs.ScrollView
			refreshControl={
				<RefreshControl
					refreshing={isPullToRefresh && hallOfFameQuery.isRefetching}
					onRefresh={() => {
						setIsPullToRefresh(true)
						hallOfFameQuery.refetch()
					}}
				/>
			}
		>
			<View
				style={css`
					padding: 20px;
				`}
			>
				<Text
					style={css`
						font-size: 12px;
						color: ${COLOR.GRAY(400)};
					`}
				>
					기준: 실시간(
					{DateTime.fromMillis(hallOfFameQuery.dataUpdatedAt).toFormat(
						'yyyy년 MM월 dd일 HH시mm분',
					)}
					)
				</Text>
				<View
					style={css`
						margin-top: 12px;
					`}
				>
					{[run, situp, pushup].map((rankingData) => (
						<View
							key={rankingData[0].workoutTypeId}
							style={css`
								overflow: hidden;
								margin-bottom: 12px;
								background: ${COLOR.GRAY(50)};
								padding: 12px;
								padding-bottom: 0;
								border-radius: 12px;
							`}
						>
							<View>
								<Text
									style={css`
										font-family: ${FONT.ROKA};
										font-size: 20px;
									`}
								>
									{rankingData[0].type.detailedName}
								</Text>
							</View>
							<View
								style={css`
									margin-top: 20px;
									flex-direction: row;
									justify-content: space-around;
									align-items: flex-end;
								`}
							>
								{rankingData.map((data, idx) => (
									<Bar
										key={String(idx)}
										index={idx}
										color={COLOR.BRAND(((3 - idx) * 100) as any)}
										data={data}
									/>
								))}
							</View>
						</View>
					))}
				</View>
			</View>
		</Tabs.ScrollView>
	)
}

const SuspendedHallOfFame: React.FC = () => (
	<AsyncBoundary
		SuspenseFallback={
			<View
				style={css`
					flex: 1;
					justify-content: center;
					align-items: center;
				`}
			>
				<Spinner />
			</View>
		}
	>
		<HallOfFameView />
	</AsyncBoundary>
)

enum RankingFilter {
	DAILY = 'daily',
	MONTHLY = 'monthly',
}

const SuspendedContent: React.FC = () => {
	const profileQuery = trpc.useQuery(['user.profile'])
	const [rankingFilter, setRankingFilter] = useState<RankingFilter>(
		RankingFilter.DAILY,
	)

	if (!profileQuery.data) return null

	const groupId = profileQuery.data.base.group
	const groupName = getGroupNameFromCode(groupId, true)

	return (
		<Tabs.Container
			renderHeader={() => (
				<View
					style={css`
						padding: 20px;
					`}
				>
					<Text
						style={css`
							font-family: ${FONT.SPOQA('BOLD')};
							font-size: 18px;
						`}
					>
						랭킹 옵션
					</Text>
					<RGRadioInput
						value={rankingFilter}
						onChange={(value) => value && setRankingFilter(value)}
						flatListProps={{
							horizontal: true,
						}}
						options={[RankingFilter.DAILY, RankingFilter.MONTHLY]}
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
								<Text
									style={css`
										margin-left: 8px;
									`}
								>
									{
										{
											[RankingFilter.DAILY]: '일별 랭킹',
											[RankingFilter.MONTHLY]: '월별 랭킹',
										}[item]
									}
								</Text>
							</View>
						)}
					/>
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
						font-family: ${FONT.SPOQA('BOLD')};
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
			<Tabs.Tab name="명예의 전당">
				<SuspendedHallOfFame />
			</Tabs.Tab>
			<Tabs.Tab name="전군 뜀걸음">
				<SuspendedRankingView id={`ALL.run.${rankingFilter}`} />
			</Tabs.Tab>
			<Tabs.Tab name="전군 팔굽혀펴기">
				<SuspendedRankingView id={`ALL.pushup.${rankingFilter}`} />
			</Tabs.Tab>
			<Tabs.Tab name="전군 윗몸일으키기">
				<SuspendedRankingView id={`ALL.situp.${rankingFilter}`} />
			</Tabs.Tab>
			<Tabs.Tab name={`${groupName} 뜀걸음`}>
				<SuspendedRankingView id={`${groupId}.run.${rankingFilter}`} />
			</Tabs.Tab>
			<Tabs.Tab name={`${groupName} 팔굽혀펴기`}>
				<SuspendedRankingView id={`${groupId}.pushup.${rankingFilter}`} />
			</Tabs.Tab>
			<Tabs.Tab name={`${groupName} 윗몸일으키기`}>
				<SuspendedRankingView id={`${groupId}.situp.${rankingFilter}`} />
			</Tabs.Tab>
		</Tabs.Container>
	)
}

const RankingScreen = () => {
	return (
		<>
			<AsyncBoundary
				SuspenseFallback={
					<View
						style={css`
							flex: 1;
							justify-content: center;
							align-items: center;
						`}
					>
						<Spinner />
					</View>
				}
			>
				<SafeAreaView
					style={css`
						flex: 1;
						justify-content: space-between;
					`}
				>
					<SuspendedContent />
				</SafeAreaView>
			</AsyncBoundary>
			<FocusAwareStatusBar style="dark" />
		</>
	)
}

export default RankingScreen
