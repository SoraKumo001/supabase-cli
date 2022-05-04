import { program } from "commander";
import { execDocker } from "../libs/docker";
import { initSupabase } from "./init";

export const stopSupabase = async () => {
  await initSupabase();
  await execDocker("stop");
};

export const stop = program
  .createCommand("stop")
  .description("Stop supabase")
  .action(stopSupabase);
