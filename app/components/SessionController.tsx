import { useAtomValue } from 'jotai'
import { Fragment } from 'react'

import { refreshTokenAtom } from '@/store/atoms/token'

const SessionController: React.FC = ({ children }) => {
	const refreshToken = useAtomValue(refreshTokenAtom)
	return <Fragment key={refreshToken}>{children}</Fragment>
}

export default SessionController
