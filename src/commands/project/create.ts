import { Argument, program, Option } from "commander";
import {
  createProject,
  getOrganizations,
  getRemoteEnv,
} from "../../libs/supabase";

export const action = async (
  name: string,
  dbpass: string,
  {
    token,
    plan = "free",
    region,
    org,
  }: {
    token?: string;
    plan?: string;
    region?: string;
    org?: string;
  }
) => {
  const config = await getRemoteEnv();
  if (!config) return;
  const accessToken = token || config.access_token || "";
  const organizationId = org || (await getOrganizations(accessToken))?.[0]?.id;
  const regionName = region || "us-east-1";
  createProject({
    token: accessToken,
    name,
    dbPass: dbpass,
    organizationId,
    region: regionName,
    plan,
  });
};

export const create = program
  .createCommand("create")
  .description("Create a project")
  .addOption(new Option("-t, --token <accessToken>", "AccessToken"))
  .addOption(new Option("-p, --plan <plan>", "Plan of project"))
  .addOption(new Option("-r, --region <region>", "Region of project"))
  .addOption(new Option("-o, --org <org>", "Organization of project"))
  .addArgument(new Argument("name", "Project name").argRequired())
  .addArgument(new Argument("dbpass", "Database Password").argRequired())
  .action(action);
