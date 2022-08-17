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
				include: {
					type: true,
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
				include: {
					type: true,
				},
				distinct: ['workoutTypeId'],
			})
		},
	})
	.query('getAllDailyGoals', {
		input: z.undefined(),
		resolve: async ({ ctx: { prisma, user } }) => {
			console.log(user.id)
			return prisma.dailyWorkoutGoal.findMany({
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

export default getDailyGoalRoute
