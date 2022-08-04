import { getMealData } from "@/services/rokagym-meal.service";
import createRouter from "@/utils/routers/createRouter";
import { BASE_CODES } from "rokameal";
import { z } from "zod";

const ZMealDataField = z.object({
  menus: z.array(z.string()),
  calories: z.number(),
});

const dailyMealRoute = createRouter().query("getDailyMeal", {
  input: z.object({
    baseCode: z.enum(BASE_CODES),
    day: z.date().optional(),
  }),
  output: z.object({
    breakfast: ZMealDataField,
    lunch: ZMealDataField,
    dinner: ZMealDataField,
  }),
  resolve: async ({ input }) =>
    getMealData(input.baseCode, input.day ?? new Date()),
});

export default dailyMealRoute;
