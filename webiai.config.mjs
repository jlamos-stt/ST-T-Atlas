export default {
  scope: "stt",
  name: "atlas",
  taxonomy: "project",

  sst: {
    app: "atlas",
  },

  sdk: {
    version: "0.23.11",
    packages: ["core", "aws", "infra-provider", "infra", "http", "ioc"],
  },

  devlink: {
    modes: {
      default: "dev",
      dev: () => ({ manager: "store" }),
    },
  },
};