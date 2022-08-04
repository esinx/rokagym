import { EventBridgeHandler } from "aws-lambda";
import { DateTime, Duration } from "luxon";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { PrismaClient } from "@prisma/client";

/**
 *
 * 현존하는 랭킹 리스트
 *
 * 1. 전군랭킹
 * 2. 군별랭킹
 * 3. 부대랭킹
 * 4. 특급전사리그
 */

const chunkArray = <T>(arr: T[], by: number): T[][] => {
  if (arr.length <= by) {
    return [arr];
  }
  const sliced = arr.slice(0, by);
  const rest = arr.slice(by);
  return [sliced, ...chunkArray(rest, by)];
};

type ExtractPromise<T> = T extends Promise<infer U> ? U : never;

export const cacheRankingData: EventBridgeHandler<
  "net.esinx.rokagym.cache-ranking-data",
  {},
  void
> = async (event) => {
  console.log(
    `[net.esinx.rokagym.cache-ranking-data] executed at: ${event.time}`
  );

  const prisma = new PrismaClient();

  const todayKST = DateTime.now().setZone("Asia/Seoul");

  // i love prisma
  const res = await prisma.workoutLog.groupBy({
    by: ["userId", "workoutTypeId"],
    where: {
      timestamp: {
        gt: todayKST.startOf("day").toJSDate(),
        lt: todayKST.endOf("day").toJSDate(),
      },
    },
    _sum: {
      value: true,
    },
    orderBy: {
      _sum: {
        value: "desc",
      },
    },
  });

  // create DynamoDB connection, write data
  // const dynamoDBClient = new DynamoDBClient({
  //   region: process.env.REGION ?? "ap-northeast-2",
  // });

  // const documentClient = DynamoDBDocument.from(dynamoDBClient);

  // const execAll = await Promise.all(
  //   chunks.map((chunk) =>
  //     documentClient.batchWrite({
  //       RequestItems: {
  //         "rokagym-meal": chunk.map(([id, content]) => ({
  //           PutRequest: {
  //             Item: { id, ...content },
  //           },
  //         })),
  //       },
  //     })
  //   )
  // );

  // console.log(`Execution result: ${JSON.stringify(execAll)}`);
  // dynamoDBClient.destroy();
  return;
};
