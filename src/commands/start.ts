import jwt from "jwt-simple";
import { init } from "./init";
import { getEnv, spawn } from "../libs/stdlibs";

export const start = async () => {
  const project = process.env.npm_package_name || "supabase";
  await init();
  await spawn(
    `docker compose -p ${project} -f supabase/docker/docker-compose.yml up -d`
  );

  const config = await getEnv();

  if (config) {
    const { JWT_SECRET, STUDIO_PORT, KONG_HTTP_PORT } = config;
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
    console.log(`\nANON_KEY: ${ANON_KEY}`);
    console.log(`SERVICE_ROLE_KEY: ${SERVICE_ROLE_KEY}`);
    console.log(`STUDIO: http://localhost:${STUDIO_PORT}/`);
    console.log(`REST API: http://localhost:${KONG_HTTP_PORT}/rest/v1/`);
    console.log(`GraphQL: http://localhost:${KONG_HTTP_PORT}/graphql/v1`);
  }
};
