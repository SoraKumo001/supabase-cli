import {
  createUser,
  getSupabaseServiceRole,
  getSupabaseUrl,
} from "../../../libs/supabase";

export const create = async (
  email: string,
  password: string,
  options: { url?: string; service_role?: string }
) => {
  const url = options.url || (await getSupabaseUrl());
  if (!url) {
    console.error("Url unknown");
    return;
  }
  const apiKey = options.service_role || (await getSupabaseServiceRole());
  if (!apiKey) {
    console.error("Service role unknown");
    return;
  }
  createUser({
    url,
    apiKey,
    email,
    password,
  });
};
