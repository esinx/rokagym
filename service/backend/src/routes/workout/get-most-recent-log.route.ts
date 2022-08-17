import { z } from 'zod'

import createAuthorizedRouter from '@/utils/routers/createAuthorizedRouter'

const getMostRecentLogRoute = createAuthorizedRouter().query(
	'getMostRecentLogs',
	{
		input: z.object({
			workoutTypeIds: z.array(z.string()),
		}),
		resolve: async ({ ctx: { prisma, user }, input: { workoutTypeIds } }) => {
			return await prisma.workoutLog.findMany({
				where: {
					userId: user.id,
					workoutTypeId: { in: workoutTypeIds },
				},
				include: {
					type: true,
				},
				orderBy: {
					timestamp: 'desc',
				},
				distinct: ['workoutTypeId'],
				take: 1,
			})
		},
	},
)

export default getMostRecentLogRoute
