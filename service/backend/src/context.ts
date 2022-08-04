import type { CreateAWSLambdaContextOptions } from '@trpc/server/adapters/aws-lambda'
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'

import { PrismaClient } from '@prisma/client'
import type { APIGatewayEvent } from 'aws-lambda'

import createJWTHandler, { RGJWTPayload } from '@/utils/jwt'

type ContextOptions =
	| CreateFastifyContextOptions
	| CreateAWSLambdaContextOptions<APIGatewayEvent>

const isFastify = (
	options: ContextOptions,
): options is CreateFastifyContextOptions => Object.hasOwn(options, 'req')

const prisma = new PrismaClient()

const createContext = (options: ContextOptions) => {
	const jwt = createJWTHandler<RGJWTPayload>({
		expTime: '1y',
		issuer: 'net.esinx.rokagym',
	})
	const authorization = isFastify(options)
		? options.req.headers.authorization
		: options.event.headers.authorization
	return {
		prisma,
		jwt,
		authorization,
	}
}

export type Context = ReturnType<typeof createContext>
export default createContext
