import { z } from 'zod'

import createAuthorizedRouter from '@/utils/routers/createAuthorizedRouter'

const logWorkoutRoute = createAuthorizedRouter().mutation('logWorkout', {
	input: z.object({
		workoutTypeId: z.string(),
		value: z.number(),
		isVerified: z.boolean(),
		comment: z.string().optional(),
	}),
	resolve: async ({ ctx: { prisma, user }, input }) => {
		const { workoutTypeId, value, isVerified, comment } = input
		const res = await prisma.workoutLog.create({
			data: {
				userId: user.id,
				workoutTypeId,
				value,
				isVerified,
				comment,
			},
		})
		return res
	},
})

export default logWorkoutRoute
