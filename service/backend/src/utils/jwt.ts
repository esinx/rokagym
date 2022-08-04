import fs from 'fs/promises'

import jwt from 'jsonwebtoken'

export interface RGJWTPayload {
	user: {
		id: string
		name: string
	}
}

const createJWTHandler = <T extends Object>({
	clockTolerance = 60,
	issuer,
	expTime = '1y',
}: {
	clockTolerance?: number
	expTime?: string
	issuer: string
}) => {
	let keyPair: {
		privateKey: Buffer
		publicKey: Buffer
	}
	return {
		async getKey() {
			if (!keyPair) {
				const privateKey = await await fs.readFile(
					process.env.PRIVATE_KEY as string,
				)
				const publicKey = await await fs.readFile(
					process.env.PUBLIC_KEY as string,
				)
				keyPair = {
					privateKey,
					publicKey,
				}
			}
			return keyPair
		},
		async sign(payload: T, _expTime?: string): Promise<string> {
			const { privateKey } = await this.getKey()
			return jwt.sign(payload, privateKey, {
				algorithm: 'RS256',
				issuer,
				expiresIn: _expTime ?? expTime,
			})
		},
		async verify(token: string): Promise<T> {
			const { publicKey } = await this.getKey()
			return jwt.verify(token, publicKey, {
				algorithms: ['RS256'],
				issuer,
				clockTolerance,
			}) as unknown as T
		},
	}
}

export default createJWTHandler
