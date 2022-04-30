import { databaseMigrateUser } from "../../libs/database";
export const up = async (name?: string) => {
  console.log("Migration of user");
  await databaseMigrateUser("supabase/migrations");
};
