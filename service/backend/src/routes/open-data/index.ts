import baseLookupRoute from '@/routes/open-data/base-lookup.route'
import fitnessTestDataRoute from '@/routes/open-data/fitness-test.route'
import hospitalDataRoute from '@/routes/open-data/hospital.route'
import regionRoutes from '@/routes/open-data/region.route'
import weatherRoute from '@/routes/open-data/weather.route'
import createRouter from '@/utils/routers/createRouter'

const openDataRoutes = createRouter()
	.merge(fitnessTestDataRoute)
	.merge(hospitalDataRoute)
	.merge(baseLookupRoute)
	.merge('weather.', weatherRoute)
	.merge(regionRoutes)

export default openDataRoutes
