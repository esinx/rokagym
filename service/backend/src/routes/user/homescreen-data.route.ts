import { TRPCError } from '@trpc/server'

import { z } from 'zod'

import { getWeatherData } from '@/routes/open-data/weather.route'
import { getMealData } from '@/services/rokagym-meal.service'
import createAuthorizedRouter from '@/utils/routers/createAuthorizedRouter'

const homescreenDataRoute = createAuthorizedRouter().query('homescreen-data', {
	input: z.void(),
	resolve: async ({ ctx: { prisma, user } }) => {
		const profile = await prisma.user.findUnique({
			where: {
				id: user.id,
			},
			include: {
				base: true,
			},
		})
		if (!profile)
			throw new TRPCError({ code: 'NOT_FOUND', cause: 'user not found' })

		const { password, ...withoutPassword } = profile
		const [nx, ny] = profile?.preferredRegionCode?.split(':')[0].split('_') ?? [
			90, 90,
		]
		const weather = await getWeatherData({
			baseDate: new Date(),
			categories: ['TMP', 'WSD', 'REH', 'PCP'],
			coordinates: { nx, ny },
		})
		const mealCode = profile?.preferredMealBaseCode
		if (mealCode) {
			const meal = await getMealData(mealCode as any, new Date())
			return {
				profile,
				meal,
				weather,
			}
		}
		return {
			profile,
			weather,
		}
	},
})

export default homescreenDataRoute
