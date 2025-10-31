---
name: Nginx Configuration for React App
about: Configure nginx to properly serve the React + Vite application
title: '[NGINX] Configure nginx for React app deployment'
labels: ['infrastructure', 'deployment', 'nginx']
assignees: ''
---

## Issue Description

After migrating from EJS templates to React + Vite, nginx needs to be properly configured to serve the built React application and proxy API requests to the Express backend.

## Current State

- ✅ React app builds successfully to `client/dist/`
- ✅ Express backend serves API endpoints on port 3000
- ✅ WebSocket support via Socket.io on the backend
- ❌ Nginx configuration not detecting/serving the new React framework

## Required Configuration

### 1. Serve Static React Build

Nginx needs to serve the built React app from `client/dist/`:

```nginx
location / {
    root /path/to/client/dist;
    try_files $uri $uri/ /index.html;
}
```

The `try_files` directive is crucial for React Router to work - all non-existent routes should fall back to `index.html`.

### 2. Reverse Proxy for API

API requests should be proxied to the Express backend:

```nginx
location /api {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 3. WebSocket Support

Socket.io connections need special handling:

```nginx
location /socket.io {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 86400;
}
```

### 4. Static Assets Caching

Optimize performance with proper caching headers:

```nginx
location /assets {
    root /path/to/client/dist;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Example Complete Configuration

See the example nginx configuration file that should be created in the repository:
- `nginx.conf.example` or `docs/nginx-config.md`

## Acceptance Criteria

- [ ] Nginx serves the React app from `client/dist/`
- [ ] React Router works correctly (no 404s on page refresh)
- [ ] API requests are properly proxied to Express backend
- [ ] WebSocket connections work for real-time updates
- [ ] Static assets are cached appropriately
- [ ] HTTPS/SSL configuration is documented (if applicable)
- [ ] Example nginx configuration file is added to the repository

## Related Files

- Backend: `server/src/server.ts`
- Vite config: `client/vite.config.ts`
- Build output: `client/dist/`

## Environment Variables

Ensure these are properly configured:
- `PORT=3000` (Express backend port)
- `CLIENT_URL` (for CORS, should match nginx domain in production)

## Testing

After configuring nginx:
1. Build the client: `npm run build:client`
2. Start the backend: `npm start`
3. Access the app through nginx
4. Verify:
   - Homepage loads
   - Navigation works (no 404s)
   - API calls succeed
   - WebSocket connection establishes
   - Real-time updates work

## Additional Notes

- In production, consider using a process manager like PM2 for the Node.js backend
- Configure appropriate security headers
- Set up proper logging for debugging
- Consider rate limiting for API endpoints
