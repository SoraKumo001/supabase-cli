import fetch from "cross-fetch";
import path from "path";
import { promises as fs } from "fs";
import { promiseLimit } from "@node-libraries/promise-limit";

export const getGitHubFileList = (
  repository: string,
  branch: string
): Promise<string[] | undefined> =>
  fetch(`${repository}/find/${branch}`)
    .then((v) => v.text())
    .then((v) => v.match(/<virtual-filter-input[\s\S]*src="(.*)"/m)?.[1])
    .then(
      (v) =>
        v &&
        fetch("https://github.com" + v, {
          headers: {
            accept: "application/json",
            "accept-encoding": "gzip, deflate, br",
          },
        })
          .then((v) => (v?.ok ? v.json() : undefined))
          .then((v) => v.paths)
    )
    .catch(() => undefined);

export const downloadGitHubFiles = async (
  repository: string,
  branch: string,
  src: string,
  outdir: string,
  options?: {
    parallels?: number;
    onDownload: (file: string) => void;
  }
) =>
  getGitHubFileList(repository, branch).then(async (files) => {
    if (files) {
      const repo = repository.match(/https:\/\/github.com\/(.*)/)?.[1];
      const ps = promiseLimit();
      for (const file of files.filter((v) => v.startsWith(src))) {
        ps.add(async () => {
          const value = await fetch(
            `https://raw.githubusercontent.com/${repo}/${branch}/${file}`
          ).then((v) => v.blob());
          if (value) {
            options?.onDownload?.(file);
            const target = path.resolve(outdir, path.relative(src, file));
            const targetDir = path.dirname(target);
            if (target) {
              await fs
                .mkdir(targetDir, { recursive: true })
                .catch(() => undefined);
              await fs.writeFile(target, value.stream());
            }
          }
        });
        await ps.wait(options?.parallels || 5);
      }
      await ps.all();
    }
  });
