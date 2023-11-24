const { flatRoutes } = require('remix-flat-routes')

/**
 * @type {import("@remix-run/dev").AppConfig}
 */
module.exports = {
  tailwind: true,
  cacheDirectory: './node_modules/.cache/remix',
  dev: { port: 4004 },
  browserNodeBuiltinsPolyfill: {
    modules: {
      crypto: true,
    },
  },
  serverModuleFormat: 'cjs',
  ignoredRouteFiles: ['**/*'],
  serverDependenciesToBundle: [
    /^remix-utils.*/,
    // If you installed is-ip optional dependency you will need these too
    'is-ip',
    'ip-regex',
    'super-regex',
    'clone-regexp',
    'function-timeout',
    'time-span',
    'convert-hrtime',
    'is-regexp',
  ],
  routes: async defineRoutes => {
    return flatRoutes('routes', defineRoutes)
  },
}

// /** @type {import('@remix-run/dev').AppConfig} */
// module.exports = {
//   tailwind: true,

//   ignoredRouteFiles: ['**/.*', '**/*.css', '**/*.test.{js,jsx,ts,tsx}'],
// }
