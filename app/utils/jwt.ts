import jwtDecode, { JwtPayload } from 'jwt-decode'
import { DateTime } from 'luxon'

export const pureDecodeJWT = <T extends Object>(token: string): T =>
	JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())

/**
 * A *fake* validator to check _only if the token hasn't been expired._
 * @param token JWT to verifyu
 * @param tolerance clock tolerance, in seconds
 */
export const verifyJWT = (token: string, tolerance: number = 0): boolean => {
	try {
		const { exp } = jwtDecode<JwtPayload>(token)
		return (
			typeof exp !== 'undefined' &&
			DateTime.fromMillis(exp * 1000)
				.diffNow()
				.as('seconds') >=
				-1 * tolerance
		)
	} catch (error) {
		console.error(error)
		return false
	}
}
