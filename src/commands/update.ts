import { spawn } from "../libs/stdlibs";
import { init } from "./init";

export const update = async () => {
  await init();
  process.chdir("supabase");
  await spawn("git pull");
  process.chdir("storage-api");
  await spawn("git pull");
};
