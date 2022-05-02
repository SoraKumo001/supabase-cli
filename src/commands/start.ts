import { migrateDatabaseUser } from "../libs/database";
import { execDocker } from "../libs/docker";
import { outputStatus } from "../libs/supabase";
import { init } from "./init";

export const start = async () => {
  await init();
  await execDocker("up -d");
  await outputStatus();

  await new Promise((resolve) => setTimeout(resolve, 3000));
  await migrateDatabaseUser({
    dir: "supabase/migrations",
  });
};
