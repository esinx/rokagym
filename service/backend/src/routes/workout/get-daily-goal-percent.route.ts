import { DateTime } from 'luxon'
import { z } from 'zod'

import createAuthorizedRouter from '@/utils/routers/createAuthorizedRouter'

const getDailyGoalPercentRoute = createAuthorizedRouter().query(
	'getDailyGoalPercent',
	{
		input: z
			.object({
				workoutTypeIds: z.array(z.string()),
			})
			.or(z.undefined()),
		resolve: async ({ ctx: { prisma, user }, input }) => {
			const goals = await prisma.dailyWorkoutGoal.findMany({
				where: {
					userId: user.id,
					...(input?.workoutTypeIds
						? { workoutTypeId: { in: input.workoutTypeIds } }
						: {}),
				},
				include: {
					type: true,
				},
				orderBy: {
					createdAt: 'desc',
				},
				distinct: ['workoutTypeId'],
			})

			const todayKST = DateTime.now().setZone('Asia/Seoul')

			const workouts = await prisma.workoutLog.groupBy({
				by: ['workoutTypeId'],
				where: {
					userId: user.id,
					...(input?.workoutTypeIds
						? { workoutTypeId: { in: input.workoutTypeIds } }
						: {}),
					timestamp: {
						gte: todayKST.startOf('day').toJSDate(),
						lte: todayKST.endOf('day').toJSDate(),
					},
				},
				_sum: {
					value: true,
				},
			})
			return goals.map(({ type, workoutTypeId, value }) => {
				const sum = workouts.find((w) => w.workoutTypeId === workoutTypeId)
					?._sum.value
				const currentValue = typeof sum === 'number' ? sum : 0
				return {
					workoutType: type,
					workoutTypeId,
					goal: value,
					currentValue,
					percent: currentValue / value,
				}
			})
		},
	},
)

export default getDailyGoalPercentRoute
