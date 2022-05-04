import { program } from "commander";
import { startSupabase } from "./start";
import { stopSupabase } from "./stop";

export const restart = program
  .createCommand("restart")
  .description("Restart supabase")
  .action(async () => {
    await stopSupabase();
    await startSupabase();
  });
