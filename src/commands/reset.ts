import {
  execDatabase,
  execDatabaseExsFiles,
  execDatabaseFiles,
  migrateDatabase,
  migrateDatabaseUser,
  resetDatabase,
} from "../libs/database";

export const reset = async () => {
  console.log("Create database");
  await resetDatabase();
  console.log("Clear users");
  await execDatabase(
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
  await execDatabaseFiles("supabase/docker/volumes/db/init");

  console.log("Migration of storage-api");
  await migrateDatabase("supabase/storage-api", "storage");

  console.log("Migration of realtime-api");
  await execDatabaseExsFiles("supabase/realtime");

  console.log("Migration of user files");
  await migrateDatabaseUser("supabase/migrations");
};
