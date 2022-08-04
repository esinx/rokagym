import { z } from 'zod'

import createAuthorizedRouter from '@/utils/routers/createAuthorizedRouter'

const createDailyWorkoutGoalRoute = createAuthorizedRouter().mutation(
	'createDailyWorkoutGoal',
	{
		input: z.object({
			workoutTypeId: z.string(),
			value: z.number(),
		}),
		resolve: async ({ ctx: { prisma, user }, input }) => {
			const { workoutTypeId, value } = input
			const res = await prisma.dailyWorkoutGoal.create({
				data: {
					userId: user.id,
					workoutTypeId,
					value,
				},
			})
			return res
		},
	},
)

export default createDailyWorkoutGoalRoute
