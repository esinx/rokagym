import "dotenv/config";
import type { AWS } from "@serverless/typescript";

import cacheRanking from "@functions/cache-ranking";

const serverlessConfiguration: AWS = {
  service: "rokagym-ranking-cache",
  frameworkVersion: "3",
  plugins: ["serverless-webpack", "serverless-webpack-prisma"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "ap-northeast-2",
    environment: {
      //API_KEY: process.env.API_KEY,
      DATABASE_URL: process.env.DATABASE_URL!,
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
  },
  // import the function via paths
  functions: { cacheRanking },
  package: {
    individually: true,
    patterns: [
      "!node_modules/.prisma/client/libquery_engine-*",
      //"node_modules/.prisma/client/libquery_engine-rhel-*",
      "!node_modules/prisma/libquery_engine-*",
      "!node_modules/@prisma/engines/**",
    ],
  },
  custom: {
    webpack: {
      includeModules: true,
    },
  },
};

module.exports = serverlessConfiguration;
