import { resetDatabase } from "../../libs/database";

export const reset = async (host: string, password: string) => {
  resetDatabase({ host, port: 5432, password });
};
