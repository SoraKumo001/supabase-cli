import { Argument, Command } from "commander";
import { create } from "./create";
import { up } from "./up";

export const migration = (c: Command) => {
  c.command("create")
    .description("Create migration")
    .addArgument(new Argument("[name]", "Migration name"))
    .action(create);
  c.command("up").description("Apply migrations").action(up);
};
