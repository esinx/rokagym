import routes from "@/routes";
import createRouter from "@/utils/routers/createRouter";

const appRouter = createRouter().merge(routes);

export type AppRouter = typeof appRouter;
export default appRouter;
