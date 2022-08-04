import "dotenv/config";

import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";

import fastifyCORS from "@fastify/cors";
import fastify from "fastify";

import appRouter from "@/app";
import createContext from "@/context";

const server = fastify({
  maxParamLength: 5000,
});

server.register(fastifyCORS, {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.startsWith("https://3000.esinx.net"))
      return callback(null, true);
    return callback(null, false);
  },
});

server.register(fastifyTRPCPlugin, {
  trpcOptions: { router: appRouter, createContext },
});

export default server;
