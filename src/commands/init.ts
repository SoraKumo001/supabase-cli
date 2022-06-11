import { promises as fs } from "fs";
import path from "path";
import { program } from "commander";
import { downloadGitHubFiles } from "../libs/github";
import { isDirectory } from "../libs/stdlibs";
import { replaceEnv, replaceKong } from "../libs/supabase";

export const initSupabase = async (forced = false) => {
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
      "supabase/system-migrations/storage-api"
    );
    await downloadGitHubFiles(
      "https://github.com/supabase/gotrue",
      "master",
      "migrations",
      "supabase/system-migrations/gotrue"
    );
    await downloadGitHubFiles(
      "https://github.com/supabase/realtime",
      "master",
      "server/priv/repo/migrations",
      "supabase/system-migrations/realtime"
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

export const init = program
  .createCommand("init")
  .description("Initialize supabase")
  .action(() => {
    initSupabase(true);
  });
