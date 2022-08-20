import { z } from 'zod'

import createRouter from '@/utils/routers/createRouter'

const hallOfFameRoute = createRouter().query('hallOfFame', {
	input: z.undefined(),
	resolve: async ({ ctx: { prisma } }) => {
		const include = {
			type: true,
			user: {
				select: {
					name: true,
					base: true,
					rank: true,
				},
			},
		}
		const [run, pushup, situp] = await prisma.$transaction([
			prisma.workoutLog.findMany({
				where: {
					workoutTypeId: '3km-run',
				},
				orderBy: {
					value: 'asc',
				},
				include,
				take: 3,
			}),
			prisma.workoutLog.findMany({
				where: {
					workoutTypeId: '2m-pushup',
				},
				orderBy: {
					value: 'desc',
				},
				include,
				take: 3,
			}),
			prisma.workoutLog.findMany({
				where: {
					workoutTypeId: '2m-situp',
				},
				orderBy: {
					value: 'desc',
				},
				include,
				take: 3,
			}),
		])
		return {
			'3km-run': run,
			'2m-pushup': pushup,
			'2m-situp': situp,
		}
	},
})

export default hallOfFameRoute
