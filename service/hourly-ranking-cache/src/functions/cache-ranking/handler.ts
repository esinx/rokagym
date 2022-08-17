import { EventBridgeHandler } from "aws-lambda";
import { DateTime } from "luxon";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { Base, MilGroup, Prisma, PrismaClient } from "@prisma/client";

/**
 *
 * 현존하는 랭킹 리스트
 *
 * 1. 전군랭킹(일별/월별)
 * 2. 군별랭킹(일별/월별)
 */
const RANKINGS = [
  {
    name: "전군",
    id: "ALL",
  },
  {
    name: "육군",
    id: "ARMY",
  },
  {
    name: "해군",
    id: "NAVY",
  },
  {
    name: "공군",
    id: "AIR_FORCE",
  },
  {
    name: "해병대",
    id: "MARINE_CORPS",
  },
  {
    name: "국방부",
    id: "MINISTRY_OF_DEFENSE",
  },
].flatMap(
  (group) =>
    ["pushup", "situp", "run"].flatMap(
      (workoutTypeId) =>
        ["daily", "monthly"].map((rankingType) => ({
          workoutTypeId,
          rankingType,
          groupId: group.id,
          id: `${group.id}.${workoutTypeId}.${rankingType}`,
        })),
      []
    ),
  []
);

type Ranking = typeof RANKINGS extends (infer T)[] ? T : never;

const chunkArray = <T>(arr: T[], by: number): T[][] => {
  if (arr.length <= by) {
    return [arr];
  }
  const sliced = arr.slice(0, by);
  const rest = arr.slice(by);
  return [sliced, ...chunkArray(rest, by)];
};

type RankingEntry = {
  userId: string;
  username: string;
  rank: string;
  baseId: string;
  basename: string;
  group: string;
  value: number;
};

export const cacheRankingData: EventBridgeHandler<
  "net.esinx.rokagym.cache-ranking-data",
  {},
  void
> = async (event) => {
  console.log(
    `[net.esinx.rokagym.cache-ranking-data] executed at: ${event.time}`
  );

  const prisma = new PrismaClient({
    // log: [
    //   {
    //     emit: "stdout",
    //     level: "query",
    //   },
    // ],
  });
  // just watch and amaze at my gorgeous sql skills
  const fetchTopOf = async ({
    limit = 30,
    workoutTypeId,
    group,
    timeRange,
  }: {
    workoutTypeId: string;
    timeRange: [Date, Date];
    limit?: number;
    group?: Base["group"];
  }): Promise<RankingEntry[]> =>
    (await prisma.$queryRaw`SELECT WorkoutLog.userId, User.name AS username, User.rank, User.baseId, Base.name AS basename, Base.group,
    SUM(WorkoutLog.value) AS value
FROM WorkoutLog
RIGHT JOIN User ON WorkoutLog.userId = User.id
RIGHT JOIN Base ON User.baseId = Base.id
WHERE WorkoutLog.timestamp > ${DateTime.fromJSDate(timeRange[0]).toISO()}
        AND WorkoutLog.timestamp < ${DateTime.fromJSDate(timeRange[1]).toISO()}
        AND WorkoutLog.workoutTypeId = ${workoutTypeId}
        ${group ? Prisma.sql`AND Base.group = ${group}` : Prisma.empty}
GROUP BY WorkoutLog.userId, WorkoutLog.workoutTypeId
ORDER BY SUM(value) DESC
LIMIT ${limit}`) as RankingEntry[];

  const fetchRanking = async (ranking: Ranking): Promise<RankingEntry[]> => {
    const todayKST = DateTime.now().setZone("Asia/Seoul");
    const range: [Date, Date] =
      ranking.rankingType === "monthly"
        ? [
            todayKST.startOf("month").toJSDate(),
            todayKST.endOf("month").toJSDate(),
          ]
        : [
            todayKST.startOf("day").toJSDate(),
            todayKST.endOf("day").toJSDate(),
          ];
    const data = await fetchTopOf({
      timeRange: range,
      workoutTypeId: ranking.workoutTypeId,
      group:
        ranking.groupId === "ALL" ? undefined : (ranking.groupId as MilGroup),
    });
    return data;
  };
  try {
    console.log("fetching rankings...");

    const allRankings = await Promise.all(
      RANKINGS.map(async (ranking) => {
        const fetched = await fetchRanking(ranking);
        console.log("did fetch", ranking.id);
        return [ranking, fetched] as [Ranking, RankingEntry[]];
      })
    );
    console.log(`Need to store: ${allRankings.length} documents`);
    const createdAt = new Date().getTime();

    // create DynamoDB connection, write data
    const dynamoDBClient = new DynamoDBClient({
      region: process.env.REGION ?? "ap-northeast-2",
      endpointDiscoveryEnabled: true,
    });

    const documentClient = DynamoDBDocument.from(dynamoDBClient);

    console.log("writing rankings...");

    const execAll = await Promise.all(
      allRankings.map(async ([{ id }, data], idx, arr) => {
        console.log(`writing  ${idx}/${arr.length}`);
        const res = await documentClient.put({
          Item: { id, createdAt, data },
          TableName: "rokagym-ranking-cache",
        });
        console.log(`did write chunk ${idx}/${arr.length}`);
        return res;
      })
    );

    //const chunks = chunkArray(allRankings, 20);
    // const execAll = await Promise.all(
    //   chunks.map(async (chunk, idx, arr) => {
    //     try {
    //       console.log(`writing chunk ${idx}/${arr.length}`);
    //       const res = await documentClient.batchWrite({
    //         RequestItems: {
    //           "rokagym-ranking-cache": chunk.map(([{ id }, data]) => ({
    //             PutRequest: {
    //               Item: { id, createdAt, data },
    //             },
    //           })),
    //         },
    //       });
    //       console.log(`did write chunk ${idx}/${arr.length}`);
    //       return res;
    //     } catch (error) {
    //       console.error("Failed to write chunk", idx);
    //     }
    //   })
    // );
    console.log(`Execution result: ${JSON.stringify(execAll)}`);
    dynamoDBClient.destroy();
  } catch (error) {
    console.error(error);
  }
  return;
};
