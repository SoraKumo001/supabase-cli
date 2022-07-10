import { Argument, program } from "commander";
import { getOrganizations, getRemoteEnv } from "../../libs/supabase";

export const action = async (accessToken?: string) => {
  const config = await getRemoteEnv();
  if (!config) return;
  const token = accessToken || config.access_token || "";
  const result = await getOrganizations(token);
  console.log(JSON.stringify(result, undefined, "  "));
};

export const list = program
  .createCommand("list")
  .description("Displaying the project list")
  .addArgument(new Argument("[accessToken]", "accessToken").argOptional())
  .action(action);
