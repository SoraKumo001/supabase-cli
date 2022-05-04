import { program } from "commander";
import { create } from "./create";
import { list } from "./list";

export const user = program.createCommand("user").description("create\nlist");
user.addCommand(create);
user.addCommand(list);
