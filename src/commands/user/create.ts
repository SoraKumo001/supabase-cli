import { Argument, program } from "commander";
import { createUser, getSupabaseEnv } from "../../libs/supabase";

export const action = async (email: string, password: string) => {
  const config = await getSupabaseEnv();
  if (!config) return;
  const apiKey = config.SERVICE_ROLE_KEY;
  const port = config.KONG_HTTP_PORT;
  createUser({ url: `http://localhost:${port}`, apiKey, email, password });
};

export const create = program
  .createCommand("create")
  .description("Create a user")
  .addArgument(new Argument("email", "User's email address").argRequired())
  .addArgument(new Argument("password", "User Password").argRequired())
  .action(action);
