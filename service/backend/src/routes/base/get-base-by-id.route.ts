import { z } from 'zod'

import createRouter from '@/utils/routers/createRouter'

const getBaseById = createRouter().query('getBaseById', {
	input: z.object({
		id: z.string(),
	}),
	resolve: async ({ input, ctx: { prisma } }) => {
		const { id } = input
		const prismaResult = await prisma.base.findUnique({
			where: {
				id,
			},
		})
		return prismaResult
	},
})

export default getBaseById
