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
		query: z.string().min(1),
	}),
	output: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			group: z
				.enum([
					'ARMY',
					'NAVY',
					'AIR_FORCE',
					'MARINE_CORPS',
					'MINISTRY_OF_DEFENSE',
				])
				.optional(),
		}),
	),
	resolve: async ({ input }) => baseLookup(input),
})

export default baseLookupRoute
