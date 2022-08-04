import { css } from '@emotion/native'
import { MaterialIcons } from '@expo/vector-icons'
import { StyleProp, Text, View, ViewStyle } from 'react-native'

import Spacer from '@/components/Spacer'
import COLOR from '@/utils/colors'

type Props = {
	errorText?: string
	errorCode?: string
	style?: StyleProp<ViewStyle>
}

const ErrorBox: React.FC<Props> = ({
	errorText,
	errorCode,
	style,
	children,
}) => (
	<View
		style={[
			css`
				background: #ffffff;
				border-radius: 8px;
				padding: 40px 20px;
				align-items: center;
				justify-content: center;
			`,
			style,
		]}
	>
		<MaterialIcons name="error" size={36} color={COLOR.ALERT('neg')} />
		<Text
			style={css`
				margin-top: 8px;
				font-size: 18px;
				text-align: center;
			`}
		>
			{errorText ?? '오류가 발생했습니다'}
		</Text>
		{errorCode ? (
			<Text
				style={css`
					margin-top: 8px;
					font-size: 18px;
					text-align: center;
				`}
			>
				({errorCode})
			</Text>
		) : null}
		<Spacer y={8} />
		{children}
	</View>
)

export default ErrorBox
