import { getEnv } from "../../libs/stdlibs";
import { createUser } from "../../libs/supabase";

export const create = async (email: string, password: string) => {
  const config = await getEnv();
  if (!config) return;
  const apiKey = config.SERVICE_ROLE_KEY;
  const port = config.KONG_HTTP_PORT;
  createUser({ url: `http://localhost:${port}`, apiKey, email, password });
};
