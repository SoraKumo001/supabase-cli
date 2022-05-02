import { restoreDatabase } from "../../libs/database";
import { getDatabaseHost, getDatabasePassword } from "../../libs/supabase";

export const restore = async (
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
  await restoreDatabase({ host, port: 5432, password, fileName });
};
