import { start } from "./start";
import { stop } from "./stop";
export const restart = async () => {
  await stop();
  await start();
};
