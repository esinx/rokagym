import { z } from 'zod'

import { getRankingData } from '@/services/rokagym-ranking.service'
import createRouter from '@/utils/routers/createRouter'

const getRankingRoute = createRouter().query('getRanking', {
	input: z.object({
		id: z.string(),
	}),
	resolve: async ({ input }) => getRankingData(input.id),
})

export default getRankingRoute
