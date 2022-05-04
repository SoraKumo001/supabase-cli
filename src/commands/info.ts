import { program } from "commander";
import { outputStatus } from "../libs/supabase";

export const infoSupabase = () => {
  return outputStatus();
};

export const info = program
  .createCommand("info")
  .description("View access to supabase")
  .action(infoSupabase);
