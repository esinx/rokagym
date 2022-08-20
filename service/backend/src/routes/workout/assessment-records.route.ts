import { z } from 'zod'

import createAuthorizedRouter from '@/utils/routers/createAuthorizedRouter'

const assessmentRoutes = createAuthorizedRouter()
	.query('getMostRecentAssessment', {
		input: z.object({
			workoutTypeIds: z.array(z.string()).optional(),
		}),
		resolve: async ({ ctx: { prisma, user }, input }) => {
			const mostRecentLogs = await prisma.workoutLog.findMany({
				where: {
					userId: user.id,
					type: {
						tags: {
							has: 'ASSESSED',
						},
						...(input.workoutTypeIds
							? {
									id: {
										in: input.workoutTypeIds,
									},
							  }
							: {}),
					},
				},
				include: {
					type: true,
				},
				orderBy: {
					timestamp: 'desc',
				},
				distinct: ['workoutTypeId'],
				take: 3,
			})
			return mostRecentLogs
		},
	})
	.query('getAllAssessment', {
		input: z.object({
			workoutTypeIds: z.array(z.string()).optional(),
		}),
		resolve: async ({ ctx: { prisma, user }, input }) =>
			prisma.workoutLog.findMany({
				where: {
					userId: user.id,
					type: {
						tags: {
							has: 'ASSESSED',
						},
						...(input.workoutTypeIds
							? {
									id: {
										in: input.workoutTypeIds,
									},
							  }
							: {}),
					},
				},
				include: {
					type: true,
				},
				orderBy: {
					timestamp: 'desc',
				},
			}),
	})

export default assessmentRoutes
