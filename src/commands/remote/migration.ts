import { migrateDatabaseUser } from "../../libs/database";
import { getDatabaseHost, getDatabasePassword } from "../../libs/supabase";
export const migration = async (options: {
  host?: string;
  password?: string;
}) => {
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
