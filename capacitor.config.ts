import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.aashishbharti.atomichabits",
  appName: "Atomic Habits",
  webDir: "out",
  backgroundColor: "#0b0e14",
  android: {
    allowMixedContent: false,
  },
};

export default config;
