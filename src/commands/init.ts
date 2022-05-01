import { isDirectory } from "../libs/stdlibs";
import { promises as fs } from "fs";
import { downloadGitHubFiles } from "../libs/github";
import { replaceEnv, replaceKong } from "../libs/supabase";

export const init = async (forced = false) => {
  if (!isDirectory("supabase") || forced) {
    await fs.mkdir("supabase").catch(() => undefined);
    await downloadGitHubFiles(
      "https://github.com/supabase/supabase",
      "master",
      "docker/",
      "supabase/docker"
    );
    if (!(await fs.stat("supabase/docker/.env").catch(() => undefined)))
      fs.copyFile("supabase/docker/.env.example", "supabase/docker/.env");

    await downloadGitHubFiles(
      "https://github.com/supabase/storage-api",
      "master",
      "migrations/tenant/",
      "supabase/storage-api"
    );
    await downloadGitHubFiles(
      "https://github.com/supabase/realtime",
      "master",
      "server/priv/repo/migrations",
      "supabase/realtime"
    );
  }
  await replaceEnv();
  await replaceKong();
};
