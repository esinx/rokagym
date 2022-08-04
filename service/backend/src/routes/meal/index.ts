import dailyMealRoute from "@/routes/meal/get-meal.route";
import createRouter from "@/utils/routers/createRouter";

const mealRoutes = createRouter().merge(dailyMealRoute);

export default mealRoutes;
