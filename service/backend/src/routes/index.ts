import baseRoutes from '@/routes/base'
import mealRoutes from '@/routes/meal'
import openDataRoutes from '@/routes/open-data'
import rankingRoutes from '@/routes/ranking'
import userRoutes from '@/routes/user'
import workoutRoutes from '@/routes/workout'
import createRouter from '@/utils/routers/createRouter'

const routes = createRouter()
	.merge('meal.', mealRoutes)
	.merge('opendata.', openDataRoutes)
	.merge('user.', userRoutes)
	.merge('workout.', workoutRoutes)
	.merge('base.', baseRoutes)
	.merge('ranking.', rankingRoutes)

export default routes
