import { Argument, Command, Option } from "commander";
import { backup } from "./backup";
import { migration } from "./migration";
import { reset } from "./reset";
import { restore } from "./restore";
import { user } from "./user";

export const remote = (c: Command) => {
  c.command("restore")
    .description("Restore remote databases")
    .addOption(new Option("-a, --host <host>", "Host address of database"))
    .addOption(new Option("-p, --password <password>", "Password for database"))
    .addArgument(new Argument("filename", "Dump file").argRequired())
    .action(restore);
  c.command("backup")
    .description("Backup remote databases")
    .addOption(new Option("-a, --host <host>", "Host address of database"))
    .addOption(new Option("-p, --password <password>", "Password for database"))
    .addArgument(new Argument("filename", "Dump file").argRequired())
    .action(backup);
  c.command("migration")
    .description("Migration remote databases")
    .addOption(new Option("-a, --host <host>", "Host address of database"))
    .addOption(new Option("-p, --password <password>", "Password for database"))
    .action(migration);

  c.command("reset")
    .description("Reset the remote")
    .addOption(new Option("-a, --host <host>", "Host address of database"))
    .addOption(new Option("-p, --password <password>", "Password for database"))
    .action(reset);
  user(c.command("user").description("[command]"));
};
