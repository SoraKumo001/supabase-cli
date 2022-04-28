#!/usr/bin/env node
import { program } from "commander";
import { init } from "./commands/init";
import { remove } from "./commands/remove";
import { reset } from "./commands/reset";
import { start } from "./commands/start";
import { stop } from "./commands/stop";
import { update } from "./commands/update";

program.version(process.env.npm_package_version || "unknown");
program
  .command("init")
  .description("Initialize supabase")
  .action(() => {
    init();
  });

program
  .command("start")
  .description("Launch supabase")
  .action(() => {
    start();
  });
program
  .command("stop")
  .description("Stop supabase")
  .action(() => {
    stop();
  });
program
  .command("remove")
  .description("Remove supabase")
  .action(() => {
    remove();
  });
program
  .command("update")
  .description("Update supabase")
  .action(() => {
    update();
  });
program
  .command("reset")
  .description("Database initialization")
  .action(() => {
    reset();
  });

program.parse(process.argv);
