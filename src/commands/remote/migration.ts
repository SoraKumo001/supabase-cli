import { program, Option } from "commander";
import { migrateDatabaseUser } from "../../libs/database";
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
  console.log("Migration");
  await migrateDatabaseUser({ host, password, dir: "supabase/migrations" });
};

export const migration = program
  .createCommand("migration")
  .description("Migration remote databases")
  .addOption(new Option("-a, --host <host>", "Host address of database"))
  .addOption(new Option("-p, --password <password>", "Password for database"))
  .action(action);
