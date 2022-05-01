import { dumpDatabase } from "../libs/database";

export const backup = async (fileName: string) => {
  dumpDatabase({ fileName });
};
