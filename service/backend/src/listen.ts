import { FastifyListenOptions } from "fastify";

import server from "@/server";

const PORT = process.env.PORT ?? 3030;

(async () => {
  try {
    const address = await server.listen({
      port: PORT,
      host: "0.0.0.0",
    } as FastifyListenOptions);
    await server.ready();
    console.log(`Listening on: ${address}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
