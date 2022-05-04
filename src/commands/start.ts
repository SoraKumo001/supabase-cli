import { program } from "commander";
import { migrateDatabaseUser } from "../libs/database";
import { execDocker } from "../libs/docker";
import { outputStatus } from "../libs/supabase";
import { initSupabase } from "./init";

export const startSupabase = async () => {
  await initSupabase();
  await execDocker("up -d");
  await outputStatus();

  await new Promise((resolve) => setTimeout(resolve, 3000));
  await migrateDatabaseUser({
    dir: "supabase/migrations",
  });
};

export const start = program
  .createCommand("start")
  .description("Launch supabase")
  .action(startSupabase);
