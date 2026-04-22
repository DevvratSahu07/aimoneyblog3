import app from "./app";
import { logger } from "./lib/logger";
import { assertDatabaseConnection, getRedactedDatabaseUrl } from "@workspace/db";

const rawPort = process.env["PORT"] ?? "8080";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function main() {
  try {
    await assertDatabaseConnection();
  } catch (err) {
    logger.error(
      {
        err,
        databaseUrl: getRedactedDatabaseUrl(),
      },
      "Database connection failed during startup",
    );
    process.exit(1);
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

void main();
