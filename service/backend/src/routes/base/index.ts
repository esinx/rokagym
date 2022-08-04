import baseLookupRoute from "@/routes/base/base-lookup.route";
import createBaseRoute from "@/routes/base/create-base.route";
import createRouter from "@/utils/routers/createRouter";

const baseRoutes = createRouter().merge(createBaseRoute).merge(baseLookupRoute);

export default baseRoutes;
