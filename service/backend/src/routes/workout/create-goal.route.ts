import { z } from 'zod'

import createAuthorizedRouter from '@/utils/routers/createAuthorizedRouter'

const createWorkoutGoalRoute = createAuthorizedRouter().mutation(
	'createWorkoutGoal',
	{
		input: z.object({
			workoutTypeId: z.string(),
			value: z.number(),
		}),
		resolve: async ({ ctx: { prisma, user }, input }) => {
			const { workoutTypeId, value } = input
			const res = await prisma.workoutGoal.create({
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

export default createWorkoutGoalRoute
