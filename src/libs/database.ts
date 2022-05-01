import { promises as fs, openSync, closeSync } from "fs";
import { getEnv, spawn } from "./stdlibs";
import { Client } from "pg";
import { migrate } from "postgres-migrations";

export const execDatabase = async (
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
export const execDatabaseFiles = async (dir: string) => {
  const files = await (await fs.readdir(dir).catch(() => [])).sort();
  for (const file of files) {
    console.log("  " + file);
    const value = await fs
      .readFile(`${dir}/${file}`, "utf8")
      .catch(() => undefined);
    if (value) {
      await execDatabase("postgres", value);
    }
  }
};
export const execDatabaseExsFiles = async (dir: string) => {
  const files = await (await fs.readdir(dir).catch(() => [])).sort();
  await execDatabase(
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
      for (const sql of sqls) await execDatabase("postgres", sql);
      const id = file.match(/([^/\\]*?)_.*$/)?.[1];
      id &&
        (await execDatabase(
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
export const migrateDatabase = async (
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
export const migrateDatabaseUser = async (dir: string) => {
  const files = await (await fs.readdir(dir).catch(() => [])).sort();
  const client = await getClient("postgres");
  try {
    const schema = "cli";
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

          await execDatabase("postgres", value);
          await client.query("commit;");
        }
      }
    }
  } finally {
    await client.end();
  }
};

export const dumpDatabase = async (fileName: string) => {
  const project = process.env.npm_package_name || "supabase";
  const stream = openSync(fileName, "w");
  if (!stream) return false;

  const code = await spawn(
    `docker compose -p ${project} -f supabase/docker/docker-compose.yml exec db pg_dump postgres://postgres@localhost/postgres`,
    { stdio: ["inherit", stream, "inherit"] }
  );
  closeSync(stream);
  return code === 0;
};

export const restoreDatabase = async (fileName: string) => {
  const project = process.env.npm_package_name || "supabase";
  const stream = openSync(fileName, "r");
  if (!stream) return false;

  const code = await spawn(
    `docker compose -p ${project} -f supabase/docker/docker-compose.yml exec db psql postgres://postgres@localhost/postgres`,
    { stdio: [stream, "inherit", "inherit"] }
  );
  closeSync(stream);
  return code === 0;
};

export const resetDatabase = async () => {
  await execDatabase("template1", `DROP DATABASE IF EXISTS old;`);
  await execDatabase(
    "template1",
    `
do $$ 
  begin 
    if (select true from pg_database where datname='postgres') then
      EXECUTE 'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = ''postgres''';
      ALTER DATABASE postgres RENAME TO old;
    end if;
  end; 
$$;
`
  );
  await execDatabase(
    "template1",
    "CREATE DATABASE postgres TEMPLATE template0;"
  );
  await execDatabase("template1", `DROP DATABASE IF EXISTS old;`);
};
