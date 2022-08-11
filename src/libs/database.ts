import { promises as fs, openSync, closeSync } from "fs";
import path from "path";
import { Client, ClientConfig } from "pg";
import { migrate } from "postgres-migrations";
import { spawn } from "./stdlibs";
import { getSupabaseEnv } from "./supabase";

export const execDatabase = async ({
  host,
  dbname = "postgres",
  port,
  password,
  query,
  values,
}: {
  host?: string;
  dbname?: string;
  port?: number;
  password?: string;
  query: string;
  values?: unknown[];
}) => {
  const client = await getClient({ host, port, dbname, password });
  if (!client) return false;

  try {
    return (
      (await client.query(query, values).catch((e) => {
        console.error(e);
        return undefined;
      })) !== undefined
    );
  } finally {
    await client.end();
  }
};
export const execDatabaseFiles = async ({
  host,
  port,
  password,
  dir,
}: {
  host?: string;
  port?: number;
  password?: string;
  dir: string;
}) => {
  const files = await (await fs.readdir(dir).catch(() => [])).sort();
  for (const file of files) {
    const value = await fs
      .readFile(`${dir}/${file}`, "utf8")
      .catch(() => undefined);
    if (value) {
      console.log("  " + file);
      await execDatabase({ host, port, password, query: value });
    }
  }
};
export const execDatabaseExsFiles = async ({
  host,
  port,
  password,
  dir,
}: {
  host?: string;
  port?: number;
  password?: string;
  dir: string;
}) => {
  const files = await (await fs.readdir(dir).catch(() => [])).sort();
  await execResourceDatabase({
    host,
    port,
    password,
    fileName: "create_realtime_migration.sql",
  });
  for (const file of files) {
    console.log("  " + file);
    const value = await fs
      .readFile(`${dir}/${file}`, "utf8")
      .catch(() => undefined);
    if (value) {
      const sqls = [...value.matchAll(/execute.*?"([\s\S]*?[^\\])"/gm)].map(
        (v) => v[1].replace(/^[ ]*/gm, "")
      );
      for (const query of sqls) await execDatabase({ query });
      const id = file.match(/([^/\\]*?)_.*$/)?.[1];
      id &&
        (await execDatabase({
          host,
          port,
          password,
          query: `insert into realtime.schema_migrations values($1,now() at time zone 'utc')`,
          values: [Number(id)],
        }));
    }
  }
};
export const getClient = async (params?: {
  host?: string;
  port?: number;
  dbname?: string;
  password?: string;
}) => {
  const {
    host = "localhost",
    port: portSrc,
    dbname = "postgres",
    password: passwordSrc,
  } = params || {};
  const config = await getSupabaseEnv();
  const password = passwordSrc || config?.POSTGRES_PASSWORD;
  const port = portSrc || Number(config?.POSTGRES_PORT);
  const dbConfig: ClientConfig = {
    host: host ? host : "localhost",
    port,
    password,
    user: "postgres",
    database: dbname,
    connectionTimeoutMillis: 10_000,
  };
  const client = new Client(dbConfig);
  let isError = false;
  await client.connect((err) => {
    if (err) {
      console.error(err);
      isError = true;
    }
  });
  return isError ? undefined : client;
};
export const migrateDatabase = async ({
  host,
  port,
  dbname,
  password,
  dir,
  schema,
}: {
  host?: string;
  port?: number;
  dbname?: string;
  password?: string;
  dir: string;
  schema: string;
}) => {
  const client = await getClient({ host, port, dbname, password });
  if (!client) return false;
  try {
    await client.query(`create schema IF NOT EXISTS "${schema}"`);
    await client.query(`SET search_path to "${schema}"`);
    await client.query(`CREATE TABLE IF NOT EXISTS "${schema}".migrations (
  id integer PRIMARY KEY,
  name varchar(100) UNIQUE NOT NULL,
  hash varchar(40) NOT NULL, -- sha1 hex encoded hash of the file name and contents, to ensure it hasn't been altered since applying the migration
  executed_at timestamp DEFAULT current_timestamp
);`);
    await migrate({ client }, dir);
  } finally {
    await client.end();
  }
};
export const migrateDatabaseUser = async ({
  host,
  port,
  dbname,
  password,
  dir,
}: {
  host?: string;
  port?: number;
  dbname?: string;
  password?: string;
  dir: string;
}) => {
  const files = await (await fs.readdir(dir).catch(() => [])).sort();
  const client = await getClient({ host, port, dbname, password });
  if (!client) return false;
  try {
    const schema = "cli";

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
          if (!(await client.query(value))) {
            await client.query("rollback;");
            break;
          }
          await client.query(
            `insert into "${schema}".migrations values($1,default)`,
            [file]
          );
          await client.query("commit;");
        }
      }
    }
    await client.query("select graphql.rebuild_schema();");
  } finally {
    await client.end();
  }
};
export const migrateDatabaseGotrue = async ({
  host,
  port,
  dbname,
  password,
  dir,
}: {
  host?: string;
  port?: number;
  dbname?: string;
  password?: string;
  dir: string;
}) => {
  const files = await (await fs.readdir(dir).catch(() => [])).sort();
  const client = await getClient({ host, port, dbname, password });
  if (!client) return false;
  try {
    await client.query(`SET search_path to auth`);
    for (const file of files) {
      const value = await fs
        .readFile(`${dir}/${file}`, "utf8")
        .catch(() => undefined);

      if (value) {
        const id = file?.match(/^(.*?)_/)?.[1];
        if (!id) continue;
        const r = await client.query(
          `select true from auth.schema_migrations where version=$1`,
          [id]
        );
        if (r.rowCount === 0) {
          console.log("  " + file);
          await client.query("begin;");
          if (!(await client.query(value))) {
            await client.query("rollback;");
            break;
          }
          await client.query(`insert into auth.schema_migrations values($1)`, [
            id,
          ]);
          await client.query("commit;");
        }
      }
    }
  } finally {
    await client.end();
  }
};
export const dumpTable = async ({
  host,
  port,
  password,
  tableName,
  fileName,
}: {
  host?: string;
  port?: number;
  password?: string;
  tableName: string;
  fileName: string;
}) => {
  const project = process.env.npm_package_name || "supabase";
  const stream = openSync(fileName, "w");
  if (!stream) return false;
  const code = await spawn(
    `docker compose -p ${project} -f supabase/docker/docker-compose.yml exec db pg_dump -c -s -t "${tableName}" --if-exists postgres://postgres${
      password ? ":" + password : ""
    }@${host || "localhost"}:${port || 5432}/postgres`,
    { stdio: ["inherit", stream, "inherit"] }
  );
  closeSync(stream);
  return code === 0;
};
export const dumpDatabase = async ({
  host,
  port,
  password,
  fileName,
}: {
  host?: string;
  port?: number;
  password?: string;
  fileName: string;
}) => {
  const project = process.env.npm_package_name || "supabase";
  const stream = openSync(fileName, "w");
  if (!stream) return false;
  const code = await spawn(
    `docker compose -p ${project} -f supabase/docker/docker-compose.yml exec db pg_dump postgres://postgres${
      password ? ":" + password : ""
    }@${host || "localhost"}:${port || 5432}/postgres`,
    { stdio: ["inherit", stream, "inherit"] }
  );
  closeSync(stream);
  return code === 0;
};
export const restoreDatabase = async ({
  host,
  port,
  password,
  fileName,
}: {
  host?: string;
  port?: number;
  password?: string;
  fileName: string;
}) => {
  const project = process.env.npm_package_name || "supabase";
  const stream = openSync(fileName, "r");
  if (!stream) return false;

  const code = await spawn(
    `docker compose -p ${project} -f supabase/docker/docker-compose.yml exec db psql postgres://postgres${
      password ? ":" + password : ""
    }@${host || "localhost"}:${port || 5432}/postgres`,
    { stdio: [stream, "inherit", "inherit"] }
  );
  closeSync(stream);
  return code === 0;
};

export const clearDatabase = async (params?: {
  host?: string;
  port?: number;
  password?: string;
}) => {
  const { host, port, password } = params || {};

  await execDatabase({
    host,
    port,
    password,
    dbname: "template1",
    query: `GRANT pg_signal_backend TO postgres;`,
  });
  await execDatabase({
    host,
    port,
    password,
    dbname: "template1",
    query: `DROP DATABASE IF EXISTS old;`,
  });
  await execDatabase({
    host,
    port,
    password,
    dbname: "template1",
    query: `
do $$ 
  begin 
    if (select true from pg_database where datname='postgres') then
      EXECUTE 'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = ''postgres''';
      ALTER DATABASE postgres RENAME TO old;
    end if;
  end; 
$$;
`,
  });
  await execDatabase({
    dbname: "template1",
    host,
    port,
    password,
    query: "CREATE DATABASE postgres TEMPLATE template0;",
  });
  await execDatabase({
    dbname: "template1",
    host,
    port,
    password,
    query: "DROP DATABASE IF EXISTS old;",
  });
};
export const execResourceDatabase = async ({
  host,
  port,
  password,
  fileName,
}: {
  host?: string;
  port?: number;
  password?: string;
  fileName: string;
}) => {
  const query = await fs
    .readFile(path.resolve(__dirname, "../..", "resources", fileName), "utf8")
    .catch((e) => console.error(e));
  if (!query) return false;
  return await execDatabase({
    host,
    port,
    password,
    query,
  });
};
export const resetDatabase = async (params?: {
  host?: string;
  port?: number;
  password?: string;
}) => {
  const { host, port, password } = params || {};
  console.log("Create database");
  await clearDatabase({ host, port, password });
  console.log("Clear users");
  await execResourceDatabase({
    host,
    port,
    password,
    fileName: "clear_users.sql",
  });
  console.log("Initialization of supabase");
  await execDatabaseFiles({
    host,
    port,
    password,
    dir: "supabase/docker/volumes/db/init",
  });
  await execResourceDatabase({
    host,
    port,
    password,
    fileName: "restore_users.sql",
  });
  console.log("Migration of storage-api");
  await migrateDatabase({
    host,
    port,
    password,
    dir: "supabase/system-migrations/storage-api",
    schema: "storage",
  });
  console.log("Migration of gotrue-api");
  await migrateDatabaseGotrue({
    host,
    port,
    password,
    dir: "supabase/system-migrations/gotrue",
  });

  if (!host) {
    console.log("Migration of realtime-api");
    await execDatabaseExsFiles({
      host,
      port,
      password,
      dir: "supabase/system-migrations/realtime",
    });
  }

  console.log("Migration of user files");
  await migrateDatabaseUser({
    host,
    port,
    password,
    dir: "supabase/migrations",
  });
};
