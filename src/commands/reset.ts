import { program } from "commander";
import { resetDatabase } from "../libs/database";

export const resetSupabase = async () => {
  resetDatabase();
};
export const reset = program
  .createCommand("reset")
  .description("Database initialization")
  .action(resetSupabase);
