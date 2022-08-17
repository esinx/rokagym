import getRankingRoute from '@/routes/ranking/get-ranking.route'
import createRouter from '@/utils/routers/createRouter'

const rankingRoutes = createRouter().merge(getRankingRoute)

export default rankingRoutes
