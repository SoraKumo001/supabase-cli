import { program } from "commander";
import { spawn } from "../libs/stdlibs";
import { initSupabase } from "./init";

export const removeSupabase = async () => {
  const project = process.env.npm_package_name || "supabase";
  await initSupabase();
  await spawn(
    `docker compose -p ${project} -f supabase/docker/docker-compose.yml down`
  );
};

export const remove = program
  .createCommand("remove")
  .description("Remove supabase")
  .action(removeSupabase);
