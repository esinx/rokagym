import { EventBridgeHandler } from "aws-lambda";
import { BASE_CODES, MealFetcher, MealData } from "rokameal";
import { DateTime, Duration } from "luxon";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const chunkArray = <T>(arr: T[], by: number): T[][] => {
  if (arr.length <= by) {
    return [arr];
  }
  const sliced = arr.slice(0, by);
  const rest = arr.slice(by);
  return [sliced, ...chunkArray(rest, by)];
};

type ExtractPromise<T> = T extends Promise<infer U> ? U : never;

// fix 2136 fuckup
const BASES = BASE_CODES.filter((code) => code !== "2136");

export const storeMealData: EventBridgeHandler<
  "net.esinx.rokagym.meal-data-update",
  {},
  void
> = async (event) => {
  console.log(
    `[net.esinx.rokagym.meal-data-update] executed at: ${event.time}`
  );

  try {
    const mealFetcher = new MealFetcher(process.env.API_KEY);

    const preloadAllMeals = await Promise.all(
      BASES.map(async (code) => [code, await mealFetcher.preloadMeal(code)])
    );

    const meals: Record<
      typeof BASES[number],
      ExtractPromise<ReturnType<typeof mealFetcher.preloadMeal>>
    > = Object.fromEntries(preloadAllMeals);

    // D-1 ~ D+1
    const todayInKST = DateTime.fromJSDate(new Date(), { zone: "Asia/Seoul" });
    const daysFormatted = [
      todayInKST,
      todayInKST.plus(
        Duration.fromObject({
          days: 1,
        })
      ),
      todayInKST.minus(
        Duration.fromObject({
          days: 1,
        })
      ),
    ].map((day) => day.toFormat("yyyy-MM-dd"));

    const allPairs = BASES.flatMap((code) =>
      daysFormatted.map((day) => [`${code}-${day}`, meals[code].get(day)])
    ) as [string, MealData][];

    const chunks = chunkArray(allPairs, 25);

    // create DynamoDB connection, write data
    const dynamoDBClient = new DynamoDBClient({
      region: process.env.REGION ?? "ap-northeast-2",
    });

    const documentClient = DynamoDBDocument.from(dynamoDBClient);

    const execAll = await Promise.all(
      chunks.map((chunk) =>
        documentClient.batchWrite({
          RequestItems: {
            "rokagym-meal": chunk.map(([id, content]) => ({
              PutRequest: {
                Item: { id, ...content },
              },
            })),
          },
        })
      )
    );
    console.log(`Execution result: ${JSON.stringify(execAll)}`);
    dynamoDBClient.destroy();
  } catch (error) {
    console.error(error);
  }
  return;
};
