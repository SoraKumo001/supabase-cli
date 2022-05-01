import { restoreDatabase } from "../../libs/database";

export const restore = async (
  host: string,
  password: string,
  fileName: string
) => {
  await restoreDatabase({ host, port: 5432, password, fileName });
};
