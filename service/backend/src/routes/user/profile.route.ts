import * as trpc from '@trpc/server'

import { z } from 'zod'

import createAuthorizedRouter from '@/utils/routers/createAuthorizedRouter'

const profileRoute = createAuthorizedRouter().query('profile', {
	input: z.void(),
	resolve: async ({ ctx: { prisma, user } }) => {
		const res = await prisma.user.findUnique({
			where: {
				id: user.id,
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

export default profileRoute
