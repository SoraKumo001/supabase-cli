import { promises as fs } from "fs";
import path from "path";
import { downloadGitHubFiles } from "../libs/github";
import { isDirectory } from "../libs/stdlibs";
import { replaceEnv, replaceKong } from "../libs/supabase";

export const init = async (forced = false) => {
  if (!isDirectory("supabase") || forced) {
    await fs.mkdir("supabase").catch(() => undefined);
    await downloadGitHubFiles(
      "https://github.com/supabase/supabase",
      "master",
      "docker/",
      "supabase/docker",
      {
        onDownload: async (src, dest) => {
          if (path.basename(src) === ".gitignore") {
            if (await fs.stat(dest).catch(() => undefined)) {
              return false;
            }
          }
          return true;
        },
      }
    );
    if (!(await fs.stat("supabase/docker/.env").catch(() => undefined)))
      fs.copyFile("supabase/docker/.env.example", "supabase/docker/.env");
    await fs.writeFile("supabase/docker/dev/data.sql", "");
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
    if (!(await fs.stat("supabase/.env.remote").catch(() => undefined))) {
      fs.writeFile(
        "supabase/.env.remote",
        "url=\nservice_role=\ndb_password=\n",
        "utf8"
      );
    }
    if (!(await fs.stat("supabase/.gitignore").catch(() => undefined))) {
      fs.writeFile("supabase/.gitignore", ".env.remote\n", "utf8");
    }
  }
  await replaceEnv();
  await replaceKong();
};
