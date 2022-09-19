module.exports = {
  reactStrictMode: true,
  compress: true,
  // webpack: (config) => {
  //   config.experiments = { ...config.experiments, ...{ topLevelAwait: true }};
  //   return config;
  // },
  webpack: (config, options) => {
    config.experiments = {
      topLevelAwait: true,
    };
    return config;
  },
};
