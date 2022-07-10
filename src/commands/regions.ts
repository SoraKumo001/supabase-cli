import { program } from "commander";
import { getRegions } from "../libs/supabase";

export const list = () => {
  console.log(JSON.stringify(getRegions(), undefined, "  "));
};

export const regions = program
  .createCommand("regions")
  .description("List of region")
  .action(list);
