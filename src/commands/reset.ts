import { resetDatabase } from "../libs/database";

export const reset = async () => {
  resetDatabase();
};
