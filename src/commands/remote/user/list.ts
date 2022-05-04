import { program, Option } from "commander";
import {
  getSupabaseServiceRole,
  getSupabaseUrl,
  getUsers,
} from "../../../libs/supabase";

export const action = async (options: {
  url?: string;
  service_role?: string;
}) => {
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
  getUsers({ url, apiKey });
};

export const list = program
  .createCommand("list")
  .description("Display of remote user list")
  .addOption(new Option("-u, --url <url>", "Url of supabase"))
  .addOption(
    new Option("-k, --service_role <service_role>", "Service role of supabase")
  )
  .action(action);
