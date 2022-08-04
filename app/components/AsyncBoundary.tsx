import { ReactNode, Suspense, SuspenseProps } from 'react'
import {
	ErrorBoundary,
	ErrorBoundaryPropsWithRender,
} from 'react-error-boundary'

type ExceptFallbackErrorBoundaryAttributes = Omit<
	ErrorBoundaryPropsWithRender,
	'fallbackRender' | 'fallback' | 'FallbackComponent'
>

type AsyncBoundaryProps = {
	children: ReactNode
	ErrorFallback: ErrorBoundaryPropsWithRender['fallbackRender']
	SuspenseFallback: SuspenseProps['fallback']
} & ExceptFallbackErrorBoundaryAttributes

const AsyncBoundary: React.FC<AsyncBoundaryProps> = ({
	children,
	ErrorFallback,
	SuspenseFallback,
	...restErrorBoundaryAttributes
}) => (
	<ErrorBoundary
		fallbackRender={ErrorFallback}
		onError={(error) => {
			console.error(error)
		}}
		{...restErrorBoundaryAttributes}
	>
		<Suspense fallback={SuspenseFallback}>{children}</Suspense>
	</ErrorBoundary>
)

export default AsyncBoundary
