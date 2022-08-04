import { handlerPath } from "@libs/handler-resolver";
import type { AWS } from "@serverless/typescript";

type RecordValue<T> = T extends Record<any, infer V> ? V : never;

const meta: RecordValue<AWS["functions"]> = {
  handler: `${handlerPath(__dirname)}/handler.storeMealData`,
  role: "arn:aws:iam::101505333709:role/rokagym-meal",
  timeout: 60,
  events: [
    {
      // every 21:00 UTC / 06:00 KST
      schedule: "cron(0 21 * * ? *)",
    },
  ],
};

export default meta;
