import http from 'http';
import httpProxy from 'http-proxy';

const proxy = httpProxy.createProxyServer({
    target: {
        host: 'localhost',
        port: 3004
    }
});

const proxyServer = http.createServer((req, res) => {
    proxy.web(req, res);
});

// Listen to the `upgrade` event and proxy the
// WebSocket requests as well.
proxyServer.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head);
});

proxyServer.listen(8015);