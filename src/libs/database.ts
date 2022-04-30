import { promises as fs } from "fs";
import { getEnv } from "./stdlibs";
import { Client } from "pg";
import { migrate } from "postgres-migrations";

export const databaseExec = async (
  dbname: string,
  query: string,
  values?: unknown[]
) => {
  const client = await getClient(dbname);
  await client.connect();
  try {
    if (!values)
      return await client.query(query).catch((e) => console.error(e));
    return await client.query(query, values).catch((e) => console.error(e));
  } finally {
    await client.end();
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
export const databaseExecExsFiles = async (dir: string) => {
  const files = await (await fs.readdir(dir).catch(() => [])).sort();
  await databaseExec(
    "postgres",
    `create table IF NOT EXISTS realtime.schema_migrations (
    version bigint not null
    , inserted_at timestamp(0) without time zone
    , primary key (version));`
  );
  for (const file of files) {
    console.log("  " + file);
    const value = await fs
      .readFile(`${dir}/${file}`, "utf8")
      .catch(() => undefined);
    if (value) {
      const sqls = [...value.matchAll(/execute.*?"([\s\S]*?[^\\])"/gm)].map(
        (v) => v[1].replace(/^[ ]*/gm, "")
      );
      for (const sql of sqls) await databaseExec("postgres", sql);
      const id = file.match(/([^/\\]*?)_.*$/)?.[1];
      id &&
        (await databaseExec(
          "postgres",
          `insert into realtime.schema_migrations values($1,now() at time zone 'utc')`,
          [Number(id)]
        ));
    }
  }
};
export const getClient = async (dbname: string) => {
  const config = await getEnv();
  const password = config?.POSTGRES_PASSWORD;
  const port = config?.POSTGRES_PORT;
  const dbConfig = {
    connectionString: `postgresql://postgres:${password}@localhost:${port}/${dbname}`,
    connectionTimeoutMillis: 10_000,
  };
  return new Client(dbConfig);
};
export const databaseMigrate = async (
  migrationsDirectory: string,
  schema: string
) => {
  const client = await getClient("postgres");
  try {
    await client.connect();
    await client.query(`create schema IF NOT EXISTS "${schema}"`);
    await client.query(`SET search_path to "${schema}"`);
    await client.query(`CREATE TABLE IF NOT EXISTS "${schema}".migrations (
  id integer PRIMARY KEY,
  name varchar(100) UNIQUE NOT NULL,
  hash varchar(40) NOT NULL, -- sha1 hex encoded hash of the file name and contents, to ensure it hasn't been altered since applying the migration
  executed_at timestamp DEFAULT current_timestamp
);`);
    await migrate({ client }, migrationsDirectory);
  } finally {
    await client.end();
  }
};
export const databaseMigrateUser = async (dir: string) => {
  const files = await (await fs.readdir(dir).catch(() => [])).sort();
  const client = await getClient("postgres");
  try {
    const schema = "supabase";
    await client.connect();
    await client.query(`create schema IF NOT EXISTS "${schema}"`);
    await client.query(`CREATE TABLE IF NOT EXISTS "${schema}".migrations (
  name varchar(256) PRIMARY KEY,
  executed_at timestamp DEFAULT current_timestamp
);`);

    for (const file of files) {
      const value = await fs
        .readFile(`${dir}/${file}`, "utf8")
        .catch(() => undefined);
      if (value) {
        const r = await client.query(
          `select true from "${schema}".migrations where name=$1`,
          [file]
        );
        if (r.rowCount === 0) {
          console.log("  " + file);
          await client.query("begin;");
          await client.query(
            `insert into "${schema}".migrations values($1,default)`,
            [file]
          );

          await databaseExec("postgres", value);
          await client.query("commit;");
        }
      }
    }
  } finally {
    await client.end();
  }
};
