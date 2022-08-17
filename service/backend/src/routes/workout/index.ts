import createDailyWorkoutGoalRoute from '@/routes/workout/create-daily-goal.route'
import createWorkoutGoalRoute from '@/routes/workout/create-goal.route'
import getDailyGoalRoute from '@/routes/workout/get-daily-goal.route'
import getDailyGoalPercentRoute from '@/routes/workout/get-daily-goal-percent.route'
import getGoalRoute from '@/routes/workout/get-goal.route'
import getMostRecentLogRoute from '@/routes/workout/get-most-recent-log.route'
import getWorkoutTypesRoute from '@/routes/workout/get-workout-types.route'
import logWorkoutRoute from '@/routes/workout/log-workout.route'
import createRouter from '@/utils/routers/createRouter'

const workoutRoutes = createRouter()
	.merge(createWorkoutGoalRoute)
	.merge(createDailyWorkoutGoalRoute)
	.merge(logWorkoutRoute)
	.merge(getGoalRoute)
	.merge(getDailyGoalRoute)
	.merge(getDailyGoalPercentRoute)
	.merge(getWorkoutTypesRoute)
	.merge(getMostRecentLogRoute)

export default workoutRoutes
