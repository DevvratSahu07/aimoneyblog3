import { defineConfig } from "drizzle-kit";
import { getDatabaseUrl } from "./src/database-url";
import { loadRootEnv } from "./src/load-env";

loadRootEnv();

export default defineConfig({
  schema: "./src/schema/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
