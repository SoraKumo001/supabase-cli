import {
  getSupabaseServiceRole,
  getSupabaseUrl,
  getUsers,
} from "../../../libs/supabase";

export const list = async (options: {
  url?: string;
  service_role?: string;
}) => {
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
  getUsers({ url, apiKey });
};
