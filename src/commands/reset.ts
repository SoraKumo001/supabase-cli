import {
  databaseExec,
  databaseExecExsFiles,
  databaseExecFiles,
  databaseMigrate,
} from "../libs/database";

export const reset = async () => {
  console.log("Create database");
  await databaseExec("template1", `DROP DATABASE IF EXISTS old;`);
  await databaseExec(
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
  await databaseExec(
    "template1",
    "CREATE DATABASE postgres TEMPLATE template0;"
  );
  await databaseExec("template1", `DROP DATABASE IF EXISTS old;`);
  console.log("Clear users");
  await databaseExec(
    "postgres",
    `
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
  `
  );
  console.log("Initialization of supabase");
  await databaseExecFiles("supabase/docker/volumes/db/init");

  console.log("Migration of storage-api");
  await databaseMigrate("supabase/storage-api");

  console.log("Migration of realtime-api");
  await databaseExecExsFiles("supabase/realtime");

  console.log("Migration of user");
  await databaseExecFiles("supabase/migrations");
};
