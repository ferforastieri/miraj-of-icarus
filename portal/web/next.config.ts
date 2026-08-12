import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  output: process.env.MIRAJ_OF_ICARUS_STANDALONE_BUILD === "true" ? "standalone" : undefined,
};

export default nextConfig;

initOpenNextCloudflareForDev();
