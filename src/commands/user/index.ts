import { Argument, Command } from "commander";
import { create } from "./create";
import { list } from "./list";

export const user = (c: Command) => {
  c.command("create")
    .description("Create a user")
    .addArgument(new Argument("email", "User's email address").argRequired())
    .addArgument(new Argument("password", "User Password").argRequired())
    .action(create);
  c.command("list").description("Displaying the user list").action(list);
};
