import { program } from "commander";
import { create } from "./create";
//import { del } from "./delete";
import { list } from "./list";
//import { pause } from "./pause";

export const project = program
  .createCommand("project")
  .description("list\ncreate");

project.addCommand(create);
project.addCommand(list);
//project.addCommand(pause);
//project.addCommand(del);
