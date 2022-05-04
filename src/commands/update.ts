import { program } from "commander";
import { spawn } from "../libs/stdlibs";
import { initSupabase } from "./init";

export const updateSupabase = async () => {
  await initSupabase();
  process.chdir("supabase");
  await spawn("git pull");
  process.chdir("storage-api");
  await spawn("git pull");
};

export const update = program
  .createCommand("update")
  .description("Update supabase")
  .action(updateSupabase);
