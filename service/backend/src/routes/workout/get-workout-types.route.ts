import { z } from 'zod'

import createRouter from '@/utils/routers/createRouter'

const getWorkoutTypesRoute = createRouter()
	.query('getCoreWorkouts', {
		input: z.undefined(),
		resolve: async ({ ctx: { prisma } }) =>
			prisma.workoutType.findMany({
				where: {
					tags: {
						has: 'CORE',
					},
				},
			}),
	})
	.query('getWorkouts', {
		input: z.undefined(),
		resolve: async ({ ctx: { prisma } }) => prisma.workoutType.findMany(),
	})

export default getWorkoutTypesRoute
