import "dotenv/config";
import type { AWS } from "@serverless/typescript";

import storeMealData from "@functions/cache-ranking";

const serverlessConfiguration: AWS = {
  service: "daily-meal-data",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "ap-northeast-2",
    environment: {
      API_KEY: process.env.API_KEY,
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
  },
  // import the function via paths
  functions: { storeMealData },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
