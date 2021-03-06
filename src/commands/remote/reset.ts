import { program, Option } from "commander";
import { resetDatabase } from "../../libs/database";
import { getDatabaseHost, getDatabasePassword } from "../../libs/supabase";

export const action = async (options: { host?: string; password?: string }) => {
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
  resetDatabase({ host, port: 5432, password });
};

export const reset = program
  .createCommand("reset")
  .description("Reset the remote")
  .addOption(new Option("-a, --host <host>", "Host address of database"))
  .addOption(new Option("-p, --password <password>", "Password for database"))
  .action(action);
