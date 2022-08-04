import { z } from 'zod'

import baseLookup from '@/utils/baseLookup'
import createRouter from '@/utils/routers/createRouter'

const baseLookupRoute = createRouter().query('baseLookup', {
	input: z.object({
		group: z.enum([
			'ARMY',
			'NAVY',
			'AIR_FORCE',
			'MARINE_CORPS',
			'MINISTRY_OF_DEFENSE',
		]),
		query: z.string(),
	}),
	output: z.array(
		z.object({
			// id only exists for registered bases
			id: z.string().optional(),
			// inferredUnitCode could or could not exist for registered bases
			inferredUnitCode: z.string().optional().nullable(),
			name: z.string(),
		}),
	),
	resolve: async ({ input, ctx: { prisma } }) => {
		const { group, query } = input
		// prisma + api
		const prismaResult = await prisma.base.findMany({
			where: {
				group,
				name: {
					contains: query,
				},
			},
		})
		const apiResult = await baseLookup(input)
		const filteredApiResult = apiResult.filter(
			({ id }) =>
				!prismaResult.some(({ inferredUnitCode }) => id === inferredUnitCode),
		)
		const convertedResult = filteredApiResult.map(({ id, name }) => ({
			inferredUnitCode: id,
			name,
		}))
		return [...prismaResult, ...convertedResult]
	},
})

export default baseLookupRoute
