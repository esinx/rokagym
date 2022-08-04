import { cloneElement } from 'react'

const nest = (children: React.ReactNode, component: React.ReactElement) =>
	cloneElement(component, {}, children)

export type MultiProviderProps = React.PropsWithChildren<{
	providers: React.ReactElement[]
}>

const MultiProvider: React.FC<MultiProviderProps> = ({
	children,
	providers,
}) => <>{providers.reduceRight(nest, children)}</>

export default MultiProvider
