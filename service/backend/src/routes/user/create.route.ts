import { z } from 'zod'

import { hashPassword } from '@/utils/hash'
import createRouter from '@/utils/routers/createRouter'
import dateSchema from '@/utils/zod-date-schema'

const createUserRoute = createRouter().mutation('createUser', {
	input: z.object({
		name: z.string(),
		email: z.string().email(),
		password: z.string(),
		birthday: dateSchema,
		// TODO: make this an enum?
		rank: z.string(),
		sex: z.enum(['MALE', 'FEMALE', 'NONBINARY']),
		baseId: z.string(),
	}),
	resolve: async ({ ctx, input }) => {
		const { prisma, jwt } = ctx
		const { name, email, password, birthday, rank, sex, baseId } = input
		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: await hashPassword(password),
				birthday,
				rank,
				sex,
				baseId,
			},
		})
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

export default createUserRoute
