import { execDocker } from "../libs/docker";
import { init } from "./init";

export const stop = async () => {
  await init();
  await execDocker("stop");
};
