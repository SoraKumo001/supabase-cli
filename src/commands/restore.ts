import { clearDatabase, restoreDatabase } from "../libs/database";

export const restore = async (fileName: string) => {
  await clearDatabase();
  await restoreDatabase({ fileName });
};
