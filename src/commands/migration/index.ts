import { program } from "commander";
import { create } from "./create";
import { up } from "./up";

export const migration = program
  .createCommand("migration")
  .description("create\nup");
migration.addCommand(create);
migration.addCommand(up);
