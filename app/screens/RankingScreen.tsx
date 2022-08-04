import { css } from '@emotion/native'
import { SafeAreaView, Text, View } from 'react-native'
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view'

import FocusAwareStatusBar from '@/components/FocusAwareStatusBar'
import PercentIcon from '@/components/icons/Percent'
import COLOR from '@/utils/colors'

const DummyScrollView = () => (
	// @ts-expect-error
	<Tabs.ScrollView>
		<View
			style={css`
				min-height: 1200px;
			`}
		/>
	</Tabs.ScrollView>
)

const RankingScreen = () => {
	return (
		<>
			<SafeAreaView
				style={css`
					flex: 1;
					justify-content: space-between;
				`}
			>
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
								나의 랭킹
							</Text>
							<Text
								style={css`
									font-family: ROKA;
									font-size: 32px;
								`}
							>
								전군상위
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
									7.23
								</Text>
								<PercentIcon style={{ width: 36, height: 36 }} color="#000" />
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
					<Tabs.Tab name="전군랭킹">
						<DummyScrollView />
					</Tabs.Tab>
					<Tabs.Tab name="육군랭킹">
						<DummyScrollView />
					</Tabs.Tab>
					<Tabs.Tab name="부대랭킹">
						<DummyScrollView />
					</Tabs.Tab>
					<Tabs.Tab name="특급전사 리그">
						<DummyScrollView />
					</Tabs.Tab>
					<Tabs.Tab name="급수 리그">
						<DummyScrollView />
					</Tabs.Tab>
				</Tabs.Container>
			</SafeAreaView>
			<FocusAwareStatusBar style="dark" />
		</>
	)
}

export default RankingScreen
