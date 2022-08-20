import { css } from '@emotion/native'
import { ReactNode, Suspense, SuspenseProps } from 'react'
import {
	ErrorBoundary,
	ErrorBoundaryPropsWithRender,
} from 'react-error-boundary'
import { View } from 'react-native'

import ErrorBox from '@/components/ErrorBox'
import Spinner from '@/components/Spinner'

type ExceptFallbackErrorBoundaryAttributes = Omit<
	ErrorBoundaryPropsWithRender,
	'fallbackRender' | 'fallback' | 'FallbackComponent'
>

type AsyncBoundaryProps = {
	children: ReactNode
	ErrorFallback?: ErrorBoundaryPropsWithRender['fallbackRender']
	SuspenseFallback?: SuspenseProps['fallback']
} & ExceptFallbackErrorBoundaryAttributes

const AsyncBoundary: React.FC<AsyncBoundaryProps> = ({
	children,
	ErrorFallback,
	SuspenseFallback,
	...restErrorBoundaryAttributes
}) => (
	<ErrorBoundary
		fallbackRender={
			ErrorFallback ??
			(({ error }) => {
				return (
					<ErrorBox errorText="오류가 발생했습니다" errorCode={error.message} />
				)
			})
		}
		onError={(error) => {
			console.error(error)
		}}
		{...restErrorBoundaryAttributes}
	>
		<Suspense
			fallback={
				SuspenseFallback ?? (
					<View
						style={css`
							flex: 1;
							align-items: center;
							justify-content: center;
						`}
					>
						<Spinner />
					</View>
				)
			}
		>
			{children}
		</Suspense>
	</ErrorBoundary>
)

export default AsyncBoundary
