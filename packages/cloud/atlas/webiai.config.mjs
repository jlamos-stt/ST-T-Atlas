export default {
  name: "cloud.atlas",
  taxonomy: "bundle",

  sst: {
    stack: "CloudAtlas",
  },

  dependencies: [],

  modules: {
    api: {
      hooks: {
        bundle: ["bundle"],
      },
    },

    mcp: {
      hooks: {
        bundle: ["bundle"],
      },
    },

    spa: {
      hooks: {
        build: ["build"],
      },
    },

    metrics: {},
  },
};