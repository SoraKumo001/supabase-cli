import { promises as fs } from "fs";
import { getEnv } from "./stdlibs";
import postgres from "postgres";

export const databaseExec = async (dbname: string, query: string) => {
  const config = await getEnv();
  const password = config?.POSTGRES_PASSWORD;
  const sql = postgres(
    `postgresql://postgres:${password}@localhost/${dbname}`,
    { onnotice: () => {} }
  );

  try {
    const r = await sql.unsafe(query).catch((e) => console.error(e));
  } finally {
    await sql.end();
  }
};

export const databaseExecFiles = async (dir: string) => {
  const files = await (await fs.readdir(dir).catch(() => [])).sort();
  for (const file of files) {
    console.log("  " + file);
    const value = await fs
      .readFile(`${dir}/${file}`, "utf8")
      .catch(() => undefined);
    if (value) {
      await databaseExec("postgres", value);
    }
  }
};
