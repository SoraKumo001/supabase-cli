import { Argument, program } from "commander";
import { clearDatabase, restoreDatabase } from "../libs/database";

export const restoreSupabase = async (fileName: string) => {
  await clearDatabase();
  await restoreDatabase({ fileName });
};

export const restore = program
  .createCommand("restore")
  .description("Restore database")
  .addArgument(new Argument("[filename]", "Dump file name").argRequired())
  .action(restoreSupabase);
