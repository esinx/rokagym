import { css } from '@emotion/native'
import { SafeAreaView } from 'react-native'

import FocusAwareStatusBar from '@/components/FocusAwareStatusBar'
import Rings from '@/components/Rings'

const TrainingScreen = () => {
	return (
		<>
			<SafeAreaView
				style={css`
					flex: 1;
					align-items: center;
					justify-content: center;
				`}
			>
				<Rings ringValues={[1.4, 0.7, 0.9]} size={240} />
			</SafeAreaView>
			<FocusAwareStatusBar style="dark" />
		</>
	)
}

export default TrainingScreen
