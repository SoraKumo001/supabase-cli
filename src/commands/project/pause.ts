import { Argument, program, Option } from "commander";
import { getRemoteEnv, pauseProject } from "../../libs/supabase";

export const action = async (
  id: string,
  {
    token,
  }: {
    token?: string;
  }
) => {
  const config = await getRemoteEnv();
  if (!config) return;
  const accessToken = token || config.access_token || "";
  pauseProject({
    token: accessToken,
    id,
  });
};

export const pause = program
  .createCommand("pause")
  .description("Pause a project")
  .addOption(new Option("-t, --token <accessToken>", "AccessToken"))
  .addArgument(new Argument("id", "Project id").argRequired())
  .action(action);
