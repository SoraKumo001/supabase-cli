import { program } from "commander";
import { list } from "./list";

export const organization = program
  .createCommand("organization")
  .description("list");

organization.addCommand(list);
