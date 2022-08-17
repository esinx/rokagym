import { z } from 'zod'

import createAuthorizedRouter from '@/utils/routers/createAuthorizedRouter'

const logWorkoutRoute = createAuthorizedRouter().mutation('logWorkout', {
	input: z.object({
		workoutTypeId: z.string(),
		value: z.number(),
		extraValue: z.string().optional(),
		isVerified: z.boolean(),
		comment: z.string().optional(),
		duration: z.number(),
	}),
	resolve: async ({ ctx: { prisma, user }, input }) => {
		const { workoutTypeId, value, isVerified, comment, duration, extraValue } =
			input
		const res = await prisma.workoutLog.create({
			data: {
				userId: user.id,
				workoutTypeId,
				value,
				isVerified,
				comment,
				duration,
				extraValue,
			},
		})
		return res
	},
})

export default logWorkoutRoute
