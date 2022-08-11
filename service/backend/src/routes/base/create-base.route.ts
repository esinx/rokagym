import { z } from 'zod'

import createRouter from '@/utils/routers/createRouter'

const createBaseRoute = createRouter().mutation('createBase', {
	input: z.object({
		name: z.string(),
		group: z.enum([
			'ARMY',
			'NAVY',
			'AIR_FORCE',
			'MARINE_CORPS',
			'MINISTRY_OF_DEFENSE',
			'UNKNOWN',
		]),
		inferredUnitCode: z.string().optional(),
	}),
	resolve: async ({ input, ctx: { prisma } }) => {
		const { name, group, inferredUnitCode } = input
		const res = await prisma.base.create({
			data: {
				name,
				group,
				inferredUnitCode,
			},
		})
		return res
	},
})

export default createBaseRoute
