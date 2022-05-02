import { promises as fs } from "fs";
import fetch from "cross-fetch";
import jwt from "jwt-simple";
import { getEnv, getRemoteEnv } from "./stdlibs";

export const getAccessKey = async () => {
  const config = await getEnv();
  if (!config) return {};
  const { JWT_SECRET } = config;
  const ANON_KEY = jwt.encode(
    {
      role: "anon",
      iss: "supabase-demo",
    },
    JWT_SECRET
  );
  const SERVICE_ROLE_KEY = jwt.encode(
    {
      role: "service_role",
      iss: "supabase-demo",
    },
    JWT_SECRET
  );
  return { ANON_KEY, SERVICE_ROLE_KEY };
};

export const outputStatus = async () => {
  const config = await getEnv();

  if (config) {
    const { STUDIO_PORT, KONG_HTTP_PORT, ANON_KEY, SERVICE_ROLE_KEY } = config;
    console.log(`STUDIO:   http://localhost:${STUDIO_PORT}/`);
    console.log(`REST API: http://localhost:${KONG_HTTP_PORT}/rest/v1/`);
    console.log(`GraphQL:  http://localhost:${KONG_HTTP_PORT}/graphql/v1`);
    console.log(`Mail:     http://localhost:9000/`);
    console.log(`ANON_KEY:\n ${ANON_KEY}`);
    console.log(`SERVICE_ROLE_KEY:\n ${SERVICE_ROLE_KEY}`);
  }
};

export const replaceEnv = async () => {
  const fileName = "supabase/docker/.env";
  const { ANON_KEY, SERVICE_ROLE_KEY } = await getAccessKey();
  const file = await fs.readFile(fileName, "utf8").catch(() => undefined);
  if (file) {
    const newFile = file
      .replace(/^ANON_KEY=.*/m, `ANON_KEY=${ANON_KEY}`)
      .replace(/^SERVICE_ROLE_KEY=.*/m, `SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}`);
    await fs.writeFile(fileName, newFile, "utf8");
  }
};
export const replaceKong = async () => {
  const fileName = "supabase/docker/volumes/api/kong.yml";
  const { ANON_KEY, SERVICE_ROLE_KEY } = await getAccessKey();
  const file = await fs.readFile(fileName, "utf8").catch(() => undefined);
  if (file) {
    const newFile = file
      .replace(/(- username: anon[\s\S]*?- key: )(.*)/m, `$1${ANON_KEY}`)
      .replace(
        /(- username: service_role[\s\S]*?- key: )(.*)/m,
        `$1${SERVICE_ROLE_KEY}`
      );
    await fs.writeFile(fileName, newFile, "utf8");
  }
};
export const getSupabaseUrl = async () => (await getRemoteEnv())?.url;

export const getSupabaseId = async () => {
  const url = await getSupabaseUrl();
  return url?.match(/https:\/\/(.*).supabase.co/)?.[1];
};

export const getDatabaseHost = async () => {
  const id = await getSupabaseId();
  return id && `db.${id}.supabase.co`;
};
export const getDatabasePassword = async () =>
  (await getRemoteEnv())?.db_password;

export const getSupabaseServiceRole = async () =>
  (await getRemoteEnv())?.service_role;

export const createUser = async ({
  url,
  apiKey,
  email,
  password,
}: {
  url: string;
  apiKey: string;
  email: string;
  password: string;
}) => {
  const body = JSON.stringify({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: email },
  });
  const result = await fetch(`${url}/auth/v1/admin/users/`, {
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
