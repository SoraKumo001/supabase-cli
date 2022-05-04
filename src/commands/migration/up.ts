import { program } from "commander";
import { migrateDatabaseUser } from "../../libs/database";
export const action = async () => {
  console.log("Migration of user");
  await migrateDatabaseUser({ dir: "supabase/migrations" });
};
export const up = program
  .createCommand("up")
  .description("Apply migrations")
  .action(action);
