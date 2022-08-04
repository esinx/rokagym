import { css } from '@emotion/native'
import { FontAwesome } from '@expo/vector-icons'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { Text } from 'react-native'
import { Image, View, ViewProps } from 'react-native'
import { PressableOpacity } from 'react-native-pressable-opacity'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { RootStackParamList, TabParamList } from '@/App'
import COLOR from '@/utils/colors'

const HomeNavigationBar: React.FC<ViewProps> = (props) => {
	const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>()
	const { top: insetTop } = useSafeAreaInsets()
	return (
		<View
			style={css`
				padding: 12px;
				background: ${COLOR.BRAND('main')};
			`}
			{...props}
		>
			<View style={{ height: insetTop }} />
			<View
				style={css`
					flex-direction: row;
					justify-content: space-between;
				`}
			>
				<View
					style={css`
						flex-direction: row;
					`}
				>
					<Image
						source={require('@/assets/inverted-icon-small.png')}
						style={{ width: 36, height: 36, borderRadius: 18 }}
					/>
					<Text
						style={css`
							margin-left: 8px;
							font-family: 'ROKA';
							font-size: 36px;
							font-weight: 700;
							color: #fff;
						`}
					>
						체력단련실
					</Text>
				</View>
				<View>
					<PressableOpacity
						onPress={() =>
							navigation
								.getParent<StackNavigationProp<RootStackParamList>>()
								.navigate('Settings')
						}
					>
						<FontAwesome name="cog" size={36} color="#FFF" />
					</PressableOpacity>
				</View>
			</View>
		</View>
	)
}
export default HomeNavigationBar
