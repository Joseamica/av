/** @type {import('@remix-run/dev').AppConfig} */
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
  ignoredRouteFiles: ['**/.*', '**/*.css', '**/*.test.{js,jsx,ts,tsx}'],
}
