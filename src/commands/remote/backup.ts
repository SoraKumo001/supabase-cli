import { dumpDatabase } from "../../libs/database";

export const backup = async (
  host: string,
  password: string,
  fileName: string
) => {
  await dumpDatabase({ host, port: 5432, password, fileName });
};
