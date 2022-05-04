import { program } from "commander";
import { backup } from "./backup";
import { migration } from "./migration";
import { reset } from "./reset";
import { restore } from "./restore";
import { user } from "./user";

export const remote = program
  .createCommand("remote")
  .description("restore\nbackup\nmigration\nreset\nuser");
remote.addCommand(restore);
remote.addCommand(backup);
remote.addCommand(migration);
remote.addCommand(reset);
remote.addCommand(user);
