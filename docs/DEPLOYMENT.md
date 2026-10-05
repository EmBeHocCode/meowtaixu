# Isolated server deployment

- Repository: https://github.com/EmBeHocCode/meowtaixu.git
- SSH alias: meow-aws; use the existing local key. Never commit credentials.
- Application: /srv/meowtaixu, service meowtaixu.service, dedicated TCP port 8082.
- Versioned releases: /srv/meowtaixu/releases/<commit>; current points to the active release.
- Each release contains tracked source and locally verified production dist output. Only dist is publicly served; source, tests and deployment configuration are outside the document root.

Build with `npm ci`, `npm test`, `npm run build` using Node >=22.12.0. Upload source archive and dist to a new versioned release. Test its Nginx configuration, switch current, then restart only meowtaixu.service. Retain previous releases for rollback. Do not change the existing system Nginx configuration or restart other websites.

The dedicated Nginx process uses the already installed binary as ubuntu, writes only its own run/log directories, and serves static files including video range requests. It is not Vite's development server. No backend dependencies are installed on the server.

The public domain is `meowtaixu.dev`, routed by the system Nginx virtual host to the isolated service on `127.0.0.1:8082`. DNS A records for `@` and `www` must resolve to `3.25.155.199`. Because `.dev` is HSTS-preloaded, issue a valid TLS certificate before presenting the domain as usable. Direct public access to port 8082 is not required once the domain virtual host is active.

HTTPS was activated on 2026-10-05 with Let's Encrypt for `meowtaixu.dev` and `www.meowtaixu.dev`. HTTP redirects to HTTPS. The certificate is managed by Certbot and the enabled `certbot.timer`; verify renewal with `systemctl status certbot.timer` and `certbot renew --dry-run` after relevant server changes.
