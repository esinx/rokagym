import * as trpc from '@trpc/server'

import { z } from 'zod'

import createAuthorizedRouter from '@/utils/routers/createAuthorizedRouter'
import dateSchema from '@/utils/zod-date-schema'

const updateRoute = createAuthorizedRouter().mutation('update', {
	input: z.object({
		name: z.string().optional(),
		password: z.string().optional(),
		rank: z.string().optional(),
		birthday: dateSchema.optional(),
		sex: z.enum(['MALE', 'FEMALE', 'NONBINARY']).optional(),
		baseId: z.string().optional(),
		preferredMealBaseCode: z.string().optional(),
		preferredRegionCode: z.string().optional(),
	}),
	resolve: async ({ ctx: { prisma, user }, input }) => {
		const res = await prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				...input,
			},
			include: {
				base: true,
			},
		})
		if (!res)
			throw new trpc.TRPCError({ code: 'NOT_FOUND', cause: 'user not found' })
		const { password, ...withoutPassword } = res
		return withoutPassword
	},
})

export default updateRoute
