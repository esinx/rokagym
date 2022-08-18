import { z } from 'zod'

import createAuthorizedRouter from '@/utils/routers/createAuthorizedRouter'

const createDailyWorkoutGoalRoute = createAuthorizedRouter().mutation(
	'createDailyWorkoutGoal',
	{
		input: z.object({
			workoutTypeId: z.string(),
			value: z.number(),
			extraValue: z.string().optional(),
			comment: z.string().optional(),
		}),
		resolve: async ({ ctx: { prisma, user }, input }) => {
			const { workoutTypeId, value, comment, extraValue } = input
			const res = await prisma.dailyWorkoutGoal.create({
				data: {
					userId: user.id,
					workoutTypeId,
					value,
					comment,
					extraValue,
				},
			})
			return res
		},
	},
)

export default createDailyWorkoutGoalRoute
