import fetch from "cross-fetch";
import { getEnv } from "../../libs/stdlibs";

export const create = async (email: string, password: string) => {
  const config = await getEnv();
  if (!config) return;
  const apiKey = config.SERVICE_ROLE_KEY;
  const port = config.KONG_HTTP_PORT;
  const body = JSON.stringify({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: email },
  });
  const result = await fetch(`http://localhost:${port}/auth/v1/admin/users/`, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
      accept: "application/json",
      apiKey,
      Authorization: `Bearer ${apiKey}`,
    },
  })
    .then((r) => r.json())
    .catch((e) => console.error(e));
  console.log(JSON.stringify(result, undefined, "  "));
};
