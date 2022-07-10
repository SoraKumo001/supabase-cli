import { Option, program } from "commander";
import { getProjects, getRemoteEnv } from "../../libs/supabase";

export const action = async ({ token }: { token?: string }) => {
  const config = await getRemoteEnv();
  if (!config) return;
  const accessToken = token || config.access_token || "";
  console.log(JSON.stringify(await getProjects(accessToken), undefined, "  "));
};

export const list = program
  .createCommand("list")
  .description("Displaying the project list")
  .addOption(new Option("-t, --token <accessToken>", "AccessToken"))
  .action(action);
