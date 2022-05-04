import { Argument, program, Option } from "commander";
import { dumpDatabase } from "../../libs/database";
import { getDatabaseHost, getDatabasePassword } from "../../libs/supabase";

export const action = async (
  fileName: string,
  options: { host?: string; password?: string }
) => {
  const host = options.host || (await getDatabaseHost());
  if (!host) {
    console.error("Host name unknown");
    return;
  }
  const password = options.host || (await getDatabasePassword());
  if (!password) {
    console.error("Password unknown");
    return;
  }
  await dumpDatabase({ host, port: 5432, password, fileName });
};

export const backup = program
  .createCommand("backup")
  .description("Backup remote databases")
  .addOption(new Option("-a, --host <host>", "Host address of database"))
  .addOption(new Option("-p, --password <password>", "Password for database"))
  .addArgument(new Argument("filename", "Dump file").argRequired())
  .action(action);
