import { TRPCError } from '@trpc/server'

import { z } from 'zod'

import { compareHash } from '@/utils/hash'
import createAuthorizedRouter from '@/utils/routers/createAuthorizedRouter'
import createRouter from '@/utils/routers/createRouter'

const invalidateRefreshTokenRoute = createAuthorizedRouter().mutation(
	'invalidateRefreshToken',
	{
		input: z.void(),
		resolve: async ({ ctx: { user, prisma }, input }) => {
			await prisma.refreshToken.delete({
				where: { userId: user.id },
			})
			return true
		},
	},
)

const loginRoute = createRouter()
	.mutation('login', {
		input: z.object({
			email: z.string().email(),
			password: z.string(),
		}),
		output: z.object({
			refreshToken: z.string(),
			accessToken: z.string(),
		}),
		resolve: async ({ ctx: { prisma, jwt }, input }) => {
			const user = await prisma.user.findUnique({
				where: {
					email: input.email,
				},
			})
			if (!user)
				throw new TRPCError({ code: 'NOT_FOUND', cause: 'UserNotFound' })
			const compareResult = await compareHash(input.password, user.password)
			if (!compareResult)
				throw new TRPCError({ code: 'FORBIDDEN', cause: 'IncorrectPassword' })
			const [refreshToken, accessToken] = await Promise.all([
				jwt.sign({
					user: {
						id: user.id,
						name: user.name,
					},
				}),
				jwt.sign(
					{
						user: {
							id: user.id,
							name: user.name,
						},
					},
					'2h',
				),
			])
			await prisma.refreshToken.upsert({
				where: {
					userId: user.id,
				},
				create: {
					userId: user.id,
					token: refreshToken,
				},
				update: {
					userId: user.id,
					token: refreshToken,
				},
			})
			return { refreshToken, accessToken }
		},
	})
	.mutation('getAccessToken', {
		input: z.object({
			refreshToken: z.string(),
		}),
		resolve: async ({ ctx: { jwt, prisma }, input }) => {
			console.log('getAccessToken')
			// validate token
			const jwtValid = await jwt.verify(input.refreshToken)
			if (!jwtValid) {
				await prisma.refreshToken.deleteMany({
					where: { token: input.refreshToken },
				})
				throw new Error('JWT invalid')
			}
			const found = await prisma.refreshToken.findFirst({
				where: {
					token: input.refreshToken,
				},
				include: {
					user: true,
				},
			})
			if (!found) {
				throw new Error('Unregistered token')
			}
			const accessToken = await jwt.sign(
				{
					user: {
						id: found.user.id,
						name: found.user.name,
					},
				},
				'2h',
			)
			return { accessToken }
		},
	})
	.merge(invalidateRefreshTokenRoute)

export default loginRoute
