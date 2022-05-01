import { promises as fs, openSync, closeSync } from "fs";
import { getEnv, spawn } from "./stdlibs";
import { Client, ClientConfig } from "pg";
import { migrate } from "postgres-migrations";

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
  await execDatabase({
    host,
    port,
    password,
    query: `create table IF NOT EXISTS realtime.schema_migrations (
    version bigint not null
    , inserted_at timestamp(0) without time zone
    , primary key (version));`,
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
      for (const sql of sqls) await execDatabase({ query: sql });
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
  const config = await getEnv();
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
    `docker compose -p ${project} -f supabase/docker/docker-compose.yml exec db pg_dump -c --if-exists postgres://postgres${
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

export const resetDatabase = async (params?: {
  host?: string;
  port?: number;
  password?: string;
}) => {
  const { host, port, password } = params || {};
  console.log("Create database");
  await clearDatabase({ host, port, password });
  console.log("Clear users");
  await execDatabase({
    host,
    port,
    password,
    query: `
    drop user if exists supabase_admin;
    drop user if exists supabase_auth_admin;
    drop user if exists authenticated;
    drop user if exists service_role;
    drop user if exists authenticator;
    drop user if exists supabase_storage_admin;
    drop user if exists dashboard_user;
    drop role if exists service_role;
    drop role if exists authenticated;
    drop role if exists anon;
    drop role if exists supabase_admin;
  `,
  });
  console.log("Initialization of supabase");
  await execDatabaseFiles({
    host,
    port,
    password,
    dir: "supabase/docker/volumes/db/init",
  });
  await execDatabase({
    host,
    port,
    password,
    query: `
ALTER TABLE auth.users add IF NOT EXISTS reauthentication_token character varying(255) default '';
ALTER TABLE auth.users add IF NOT EXISTS reauthentication_sent_at timestamp(6) with time zone;
ALTER ROLE authenticator WITH NOSUPERUSER NOINHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:02GshyCgAmMuR80elRG3zA==$iGHHc+ke7uTIAH3R81LB96RSHK3mQBqpgntQYKWYbEc=:omgA+pHNI9zhml67pswdvF8wxr4X9McFVMXskcjshkQ=';
ALTER ROLE supabase_admin WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:Ek3JpfTwntQPt3nH8RX/nQ==$gR2VWqVgd184dcWFO1VuxfvS54Kc1nHO28GOgoyNef0=:4/u9yjgNAsxn/Ef8CCdsL9YrEWhlH1GK2k3K4Wr+xoI=';
ALTER ROLE supabase_auth_admin WITH NOSUPERUSER NOINHERIT CREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:KwpL1tST/0JDjAM20fXN7g==$5ogPaRAdtoXGJYD4a5CKnR/IpBpO/QvNGdBQ82TtG/Q=:pnEvyPekmXg9GaTXRBUzlIoo4WrDRtCA8qO0MvGat2Y=';
ALTER ROLE supabase_storage_admin WITH NOSUPERUSER NOINHERIT CREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:I5FEUDziWXHfELobqERsug==$Kia0Uk1GsB7PaotwpFQmCZHL4IDx69hP+b/qNP2TW4c=:jZDB9li42uENmR1UrYKXTy+gMC6025YSq9+2q7rBUDk=';
`,
  });
  console.log("Migration of storage-api");
  await migrateDatabase({
    host,
    port,
    password,
    dir: "supabase/storage-api",
    schema: "storage",
  });

  if (!host) {
    console.log("Migration of realtime-api");
    await execDatabaseExsFiles({
      host,
      port,
      password,
      dir: "supabase/realtime",
    });
  }

  console.log("Migration of user files");
  await migrateDatabaseUser({
    host,
    port,
    password,
    dir: "supabase/migrations",
  });
  await migrateDatabaseUser({
    host,
    port,
    password,
    dir: "supabase/migrations",
  });
};
