import { getEnv } from "../../libs/stdlibs";
import { getUsers } from "../../libs/supabase";

export const list = async () => {
  const config = await getEnv();
  if (!config) return;
  const apiKey = config.SERVICE_ROLE_KEY;
  const port = config.KONG_HTTP_PORT;
  getUsers({ url: `http://localhost:${port}`, apiKey });
};
