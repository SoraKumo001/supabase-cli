import { promises as fs } from "fs";
import { Argument, program } from "commander";
export const action = async (name?: string) => {
  await fs.mkdir("supabase/migrations").catch(() => undefined);

  const fileName =
    Intl.DateTimeFormat("us", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .format(new Date())
      .replace(/[/: ]/g, "") + (name ? `_${name}` : "");
  fs.writeFile(`supabase/migrations/${fileName}.sql`, "");
};

export const create = program
  .createCommand("create")
  .description("Create migration")
  .addArgument(new Argument("[name]", "Migration name"))
  .action(action);
