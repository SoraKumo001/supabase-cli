import { program } from "commander";
import { getUsers, getSupabaseEnv } from "../../libs/supabase";

export const action = async () => {
  const config = await getSupabaseEnv();
  if (!config) return;
  const apiKey = config.SERVICE_ROLE_KEY;
  const port = config.KONG_HTTP_PORT;
  getUsers({ url: `http://localhost:${port}`, apiKey });
};

export const list = program
  .createCommand("list")
  .description("Displaying the user list")
  .action(action);
