import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export so the app can be bundled into the Capacitor Android shell
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
