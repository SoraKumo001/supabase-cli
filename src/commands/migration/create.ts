import { promises as fs } from "fs";
import { Argument, program, Option } from "commander";
import { dumpTable } from "../../libs/database";
export const action = async (
  name: string | undefined,
  { tableName }: { tableName?: string }
) => {
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
      .replace(/[/: ]/g, "") +
    (name ? `_${name}` : tableName ? `_${tableName}` : "");
  const filePath = `supabase/migrations/${fileName}.sql`;
  if (tableName) {
    dumpTable({ fileName: filePath, tableName });
  } else fs.writeFile(filePath, "");
};

export const create = program
  .createCommand("create")
  .description("Create migration")
  .addArgument(new Argument("[name]", "Migration name"))
  .addOption(new Option("-t, --tableName <tableName>", "Output table name"))
  .action(action);
