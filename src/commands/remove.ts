import { spawn } from "../libs/stdlibs";
import { init } from "./init";

export const remove = async () => {
  const project = process.env.npm_package_name || "supabase";
  await init();
  await spawn(
    `docker compose -p ${project} -f supabase/docker/docker-compose.yml down`
  );
};
