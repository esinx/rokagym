import { css } from '@emotion/native'
import { DateTime } from 'luxon'
import React from 'react'
import { SafeAreaView, Text, View } from 'react-native'
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view'

import AsyncBoundary from '@/components/AsyncBoundary'
import ErrorBox from '@/components/ErrorBox'
import FocusAwareStatusBar from '@/components/FocusAwareStatusBar'
import Spinner from '@/components/Spinner'
import COLOR from '@/utils/colors'
import FONT from '@/utils/fonts'
import getGroupNameFromCode from '@/utils/group-name'
import { trpc } from '@/utils/trpc'
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

const SuspendedContent: React.FC = () => {
	const profileQuery = trpc.useQuery(['user.profile'])

	if (!profileQuery.data) return null

	const groupId = profileQuery.data.base.group
	const groupName = getGroupNameFromCode(groupId, true)

	return (
		<Tabs.Container
			renderHeader={() => (
				<View
					style={css`
						align-items: center;
						justify-content: center;
						padding: 20px;
					`}
				></View>
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
				<SuspendedRankingView id="ALL.run.daily" />
			</Tabs.Tab>
			<Tabs.Tab name="전군 뜀걸음(일별)">
				<SuspendedRankingView id="ALL.run.daily" />
			</Tabs.Tab>
			<Tabs.Tab name="전군 팔굽혀펴기(일별)">
				<SuspendedRankingView id="ALL.pushup.daily" />
			</Tabs.Tab>
			<Tabs.Tab name="전군 윗몸일으키기(일별)">
				<SuspendedRankingView id="ALL.situp.daily" />
			</Tabs.Tab>
			<Tabs.Tab name={`${groupName} 뜀걸음(일별)`}>
				<SuspendedRankingView id={`${groupId}.run.daily`} />
			</Tabs.Tab>
			<Tabs.Tab name={`${groupName} 팔굽혀펴기(일별)`}>
				<SuspendedRankingView id={`${groupId}.pushup.daily`} />
			</Tabs.Tab>
			<Tabs.Tab name={`${groupName} 윗몸일으키기(일별)`}>
				<SuspendedRankingView id={`${groupId}.situp.daily`} />
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
