import { init } from "./init";
import { execDocker } from "../libs/docker";
import { outputStatus } from "../libs/supabase";

export const start = async () => {
  await init();
  await execDocker("up -d");

  await outputStatus();
};
