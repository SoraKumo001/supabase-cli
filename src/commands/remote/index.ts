import { Argument, Command } from "commander";
import { backup } from "./backup";
import { migration } from "./migration";
import { reset } from "./reset";
import { restore } from "./restore";

export const remote = (c: Command) => {
  c.command("restore")
    .description("Restore remote databases")
    .addArgument(new Argument("host", "Host address of database").argRequired())
    .addArgument(
      new Argument("password", "Password for database").argRequired()
    )
    .addArgument(new Argument("filename", "Dump file").argRequired())
    .action(restore);
  c.command("backup")
    .description("Backup remote databases")
    .addArgument(new Argument("host", "Host address of database").argRequired())
    .addArgument(
      new Argument("password", "Password for database").argRequired()
    )
    .addArgument(new Argument("filename", "Dump file").argRequired())
    .action(backup);
  c.command("migration")
    .description("Migration remote databases")
    .addArgument(new Argument("host", "Host address of database").argRequired())
    .addArgument(
      new Argument("password", "Password for database").argRequired()
    )
    .action(migration);

  c.command("reset")
    .description("Reset the remote")
    .addArgument(new Argument("host", "Host address of database").argRequired())
    .addArgument(
      new Argument("password", "Password for database").argRequired()
    )
    .action(reset);
};
