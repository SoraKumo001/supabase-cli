#!/usr/bin/env node
import { program } from "commander";
import { info } from "./commands/info";
import { init } from "./commands/init";
import { migration } from "./commands/migration/indetx";
import { remove } from "./commands/remove";
import { reset } from "./commands/reset";
import { restart } from "./commands/restart";
import { start } from "./commands/start";
import { stop } from "./commands/stop";
import { update } from "./commands/update";

program.version(process.env.npm_package_version || "unknown");
program
  .command("init")
  .description("Initialize supabase")
  .action(() => {
    init(true);
  });

program.command("start").description("Launch supabase").action(start);
program.command("stop").description("Stop supabase").action(stop);
program.command("restart").description("Restart supabase").action(restart);
program.command("remove").description("Remove supabase").action(remove);
program.command("update").description("Update supabase").action(update);
program.command("reset").description("Database initialization").action(reset);
program.command("info").description("View access to supabase").action(info);
migration(program.command("migration").description("[command]"));

program.parse(process.argv);
