import { z } from 'zod'

import createAuthorizedRouter from '@/utils/routers/createAuthorizedRouter'

const getDailyGoalRoute = createAuthorizedRouter()
	.query('getDailyGoal', {
		input: z.object({
			workoutTypeId: z.string(),
		}),
		resolve: async ({ ctx: { prisma, user }, input: { workoutTypeId } }) => {
			return prisma.dailyWorkoutGoal.findFirst({
				where: {
					userId: user.id,
					workoutTypeId,
				},
				orderBy: {
					createdAt: 'desc',
				},
			})
		},
	})
	.query('getDailyGoals', {
		input: z.object({
			workoutTypeIds: z.array(z.string()),
		}),
		resolve: async ({ ctx: { prisma, user }, input: { workoutTypeIds } }) => {
			return prisma.dailyWorkoutGoal.findMany({
				where: {
					userId: user.id,
					workoutTypeId: { in: workoutTypeIds },
				},
				orderBy: {
					createdAt: 'desc',
				},
				distinct: ['workoutTypeId'],
			})
		},
	})

export default getDailyGoalRoute
