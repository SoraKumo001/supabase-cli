import { Argument, program, Option } from "commander";
import { deleteProject, getRemoteEnv } from "../../libs/supabase";

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
  deleteProject({
    token: accessToken,
    id,
  });
};

export const del = program
  .createCommand("delete")
  .description("Delete a project")
  .addOption(new Option("-t, --token <accessToken>", "AccessToken"))
  .addArgument(new Argument("id", "Project id").argRequired())
  .action(action);
