export default {
  scope: "stt",
  name: "atlas",
  taxonomy: "project",

  sst: {
    app: "atlas",
  },

  sdk: {
    version: "0.23.11",
    packages: [],
  },

  devlink: {
    modes: {
      default: "dev",
      dev: () => ({ manager: "store" }),
    },
  },
};
