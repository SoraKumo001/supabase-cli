import { migrateDatabaseUser } from "../../libs/database";
export const migration = async (host: string, password: string) => {
  console.log("Migration");
  await migrateDatabaseUser({ host, password, dir: "supabase/migrations" });
};
