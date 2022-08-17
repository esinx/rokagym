import { z } from 'zod'

import createAuthorizedRouter from '@/utils/routers/createAuthorizedRouter'

const getGoalRoute = createAuthorizedRouter()
	.query('getGoals', {
		input: z.object({
			workoutTypeIds: z.array(z.string()),
		}),
		resolve: async ({ ctx: { prisma, user }, input: { workoutTypeIds } }) => {
			return prisma.workoutGoal.findMany({
				where: {
					userId: user.id,
					workoutTypeId: { in: workoutTypeIds },
				},
				orderBy: {
					createdAt: 'desc',
				},
				include: {
					type: true,
				},
				distinct: ['workoutTypeId'],
			})
		},
	})
	.query('getAllGoals', {
		input: z.undefined(),
		resolve: async ({ ctx: { prisma, user } }) => {
			console.log(user.id)
			return prisma.workoutGoal.findMany({
				where: {
					userId: user.id,
				},
				orderBy: {
					createdAt: 'desc',
				},
				include: {
					type: true,
				},
				distinct: ['workoutTypeId'],
			})
		},
	})

export default getGoalRoute
