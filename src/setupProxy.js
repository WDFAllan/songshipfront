const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/deezer-oauth',
    createProxyMiddleware({
      target: 'https://connect.deezer.com',
      changeOrigin: true,
      pathRewrite: { '^/deezer-oauth': '/oauth' },
    })
  );

  app.use(
    '/deezer-api',
    createProxyMiddleware({
      target: 'https://api.deezer.com',
      changeOrigin: true,
      pathRewrite: { '^/deezer-api': '' },
    })
  );

  app.use(
    '/spotify-oauth',
    createProxyMiddleware({
      target: 'https://accounts.spotify.com',
      changeOrigin: true,
      pathRewrite: { '^/spotify-oauth': '' },
    })
  );

  app.use(
    '/spotify-api',
    createProxyMiddleware({
      target: 'https://api.spotify.com',
      changeOrigin: true,
      pathRewrite: { '^/spotify-api': '' },
    })
  );
};
