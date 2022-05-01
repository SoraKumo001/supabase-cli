import { migrateDatabaseUser } from "../../libs/database";
export const up = async () => {
  console.log("Migration of user");
  await migrateDatabaseUser("supabase/migrations");
};
