import type { Config } from "tailwindcss";
import sharedConfig from "@ctox/tailwind-config";

const config = {
  content: ["./src/**/*.tsx"],
  presets: [sharedConfig],
} satisfies Config;

export default config;
