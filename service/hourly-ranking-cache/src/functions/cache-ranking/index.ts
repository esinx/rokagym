import { handlerPath } from "@libs/handler-resolver";
import type { AWS } from "@serverless/typescript";

type RecordValue<T> = T extends Record<any, infer V> ? V : never;

const meta: RecordValue<AWS["functions"]> = {
  handler: `${handlerPath(__dirname)}/handler.cacheRankingData`,
  role: "arn:aws:iam::101505333709:role/rokagym-ranking-cache",
  timeout: 60,
  events: [
    {
      // every 2 hours
      schedule: "cron(0 0/2 * * ? *)",
    },
  ],
  vpc: {
    securityGroupIds: ["sg-aca5c5d1"],
    subnetIds: [
      "subnet-0222f13ce0bc43a44",
      "subnet-056c6b5a4fa418b77",
      "subnet-04f9d2de31ba440f6",
    ],
  },
};

export default meta;
