import { css } from '@emotion/native'
import { SafeAreaView } from 'react-native'

import FocusAwareStatusBar from '@/components/FocusAwareStatusBar'

const RankingScreen = () => {
	return (
		<>
			<SafeAreaView
				style={css`
					flex: 1;
					justify-content: space-between;
				`}
			></SafeAreaView>
			<FocusAwareStatusBar style="dark" />
		</>
	)
}

export default RankingScreen
