import { resetDatabase, restoreDatabase } from "../libs/database";

export const restore = async (fileName: string) => {
  await resetDatabase();
  await restoreDatabase(fileName);
};
