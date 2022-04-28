import { isDirectory, spawn } from "../libs/stdlibs";
import { promises as fs } from "fs";
export const init = async () => {
  if (!isDirectory("supabase")) {
    await fs.mkdir("supabase").catch((v) => v);
    await spawn(
      "git clone --progress --no-checkout --depth 1 https://github.com/supabase/supabase supabase"
    );
    process.chdir("supabase");
    await spawn("git sparse-checkout set docker");
    await spawn("git checkout");
    fs.copyFile("docker/.env.example", "docker/.env");

    await spawn(
      "git clone --progress --no-checkout --depth 1 https://github.com/supabase/storage-api"
    );
    process.chdir("storage-api");
    await spawn("git sparse-checkout set migrations/tenant");
    await spawn("git checkout");
    process.chdir("../..");
  }
};
