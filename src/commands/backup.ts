import { Argument, program } from "commander";
import { dumpDatabase } from "../libs/database";

export const backupSupabase = async (fileName: string) => {
  dumpDatabase({ fileName });
};

export const backup = program
  .createCommand("backup")
  .description("Backup database")
  .addArgument(new Argument("[filename]", "Dump file name").argRequired())
  .action(backupSupabase);
