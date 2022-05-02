import { Argument, Command, Option } from "commander";
import { create } from "./create";

export const user = (c: Command) => {
  c.command("create")
    .description("Create a user")
    .addOption(new Option("-u, --url <url>", "Url of supabase"))
    .addOption(
      new Option(
        "-k, --service_role <service_role>",
        "Service role of supabase"
      )
    )
    .addArgument(new Argument("email", "User's email address").argRequired())
    .addArgument(new Argument("password", "User Password").argRequired())
    .action(create);
};
