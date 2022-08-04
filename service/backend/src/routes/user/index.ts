import createUserRoute from '@/routes/user/create.route'
import loginRoute from '@/routes/user/login.route'
import profileRoute from '@/routes/user/profile.route'
import updateRoute from '@/routes/user/update.route'
import createRouter from '@/utils/routers/createRouter'

const userRoutes = createRouter()
	.merge(createUserRoute)
	.merge(loginRoute)
	.merge(profileRoute)
	.merge(updateRoute)

export default userRoutes
