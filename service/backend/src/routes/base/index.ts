import baseLookupRoute from '@/routes/base/base-lookup.route'
import createBaseRoute from '@/routes/base/create-base.route'
import createRouter from '@/utils/routers/createRouter'

import getBaseById from './get-base-by-id.route'

const baseRoutes = createRouter()
	.merge(createBaseRoute)
	.merge(baseLookupRoute)
	.merge(getBaseById)

export default baseRoutes
