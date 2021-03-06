import child_process, { StdioOptions } from "child_process";
import { promises as fs } from "fs";

export const spawn = (
  command: string,
  { params = [], stdio }: { params?: string[]; stdio?: StdioOptions } = {}
) => {
  return new Promise((resolve) => {
    const args = command.split(" ").filter((v) => v.length);
    child_process
      .spawn(args[0], [...args.slice(1), ...params], {
        stdio: stdio ? stdio : "inherit",
      })
      .on("close", (code) => resolve(code));
  });
};

export const isDirectory = async (path: string) => {
  const state = await fs.stat(path).catch(() => undefined);
  return state?.isDirectory() === true;
};
