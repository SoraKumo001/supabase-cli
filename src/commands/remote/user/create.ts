import { Argument, program, Option } from "commander";
import {
  createUser,
  getSupabaseServiceRole,
  getSupabaseUrl,
} from "../../../libs/supabase";

export const action = async (
  email: string,
  password: string,
  options: { url?: string; service_role?: string }
) => {
  const url = options.url || (await getSupabaseUrl());
  if (!url) {
    console.error("Url unknown");
    return;
  }
  const apiKey = options.service_role || (await getSupabaseServiceRole());
  if (!apiKey) {
    console.error("Service role unknown");
    return;
  }
  createUser({
    url,
    apiKey,
    email,
    password,
  });
};

export const create = program
  .createCommand("create")
  .description("Create a remote user")
  .addOption(new Option("-u, --url <url>", "Url of supabase"))
  .addOption(
    new Option("-k, --service_role <service_role>", "Service role of supabase")
  )
  .addArgument(new Argument("email", "User's email address").argRequired())
  .addArgument(new Argument("password", "User Password").argRequired())
  .action(action);
