# Customer storefront

React and TypeScript storefront for the BookStore ASP.NET Core API.

## Local development

```powershell
npm install
npm run dev
```

The storefront runs at `http://localhost:5173` and reads the ASP.NET API URL from `VITE_API_URL`.

Optional environment overrides:

```text
VITE_API_URL=http://localhost:5095/api
VITE_ADMIN_URL=http://localhost:5174
```

The browser never connects directly to the database. Public catalog requests and authenticated customer operations go through the ASP.NET API. Checkout totals and stock changes are validated and committed by the server.

## Verification

```powershell
npm run verify
```
