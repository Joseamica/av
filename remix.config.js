const { flatRoutes } = require('remix-flat-routes')

/**
 * @type {import("@remix-run/dev").AppConfig}
 */
module.exports = {
  tailwind: true,
  cacheDirectory: './node_modules/.cache/remix',
  future: {
    v2_errorBoundary: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
    v2_headers: true,
  },
  ignoredRouteFiles: ['**/*'],
  routes: async defineRoutes => {
    return flatRoutes('routes', defineRoutes)
  },
}

// /** @type {import('@remix-run/dev').AppConfig} */
// module.exports = {
//   tailwind: true,

//   ignoredRouteFiles: ['**/.*', '**/*.css', '**/*.test.{js,jsx,ts,tsx}'],
// }
