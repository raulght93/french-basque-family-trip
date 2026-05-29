# Despliegue — sincronización compartida de votos

La app se despliega como un **Cloudflare Worker** que:
- sirve los assets estáticos del build de Vite (`./dist`) en cualquier ruta;
- expone `/api/votes` para guardar/leer los votos de la familia en un
  **KV Namespace**.

Cada navegador escribe sólo su propio miembro; el endpoint mergea, así que
dos personas votando a la vez no se pisan.

Ficheros relevantes:
- `worker.js` — la lógica del Worker (API + passthrough a assets).
- `wrangler.jsonc` — config (assets dir, KV binding, nombre del Worker).

## Paso 1 — crear el KV namespace (una sola vez)

Con [wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
ya logueado (`npx wrangler login`):

```bash
npx wrangler kv namespace create VOTES_KV
# Anota el "id" devuelto.
npx wrangler kv namespace create VOTES_KV --preview
# Anota el "preview_id" devuelto.
```

Pega ambos valores en `wrangler.jsonc` (sustituye `PASTE_ID_HERE` y
`PASTE_PREVIEW_ID_HERE`).

## Paso 2 — desplegar el Worker

```bash
npm run deploy   # = vite build && wrangler deploy
```

Wrangler publicará el Worker con el binding `VOTES_KV` y subirá `dist/`
como assets. El primer deploy te dirá la URL final.

Verificación rápida:

```bash
curl https://<tu-worker>.workers.dev/api/votes?trip=pvfamilia2026
# → {"byMember":{},"updatedAt":null}
```

## Iteraciones siguientes

Push al repo NO redespliega automáticamente (los Workers tradicionales no
están conectados a GitHub como Pages). Para publicar cambios:

```bash
npm run deploy
```

Si prefieres CI/CD, conecta el repo a **Workers → Connect to Git** y
Wrangler hará deploy en cada push a `main`. Necesita los mismos KV
bindings configurados en el dashboard.

## Dev local

```bash
npm run dev:worker
# = vite build && npx wrangler dev
# levanta el Worker en local con el binding KV de preview.
```

Si sólo quieres trabajar en frontend sin backend:

```bash
npm run dev
# Vite a secas; la API responderá 404 y `useVotesSync` fallará silenciosamente.
```

## Cambiar la trip key o los nombres del equipo

- **Nombres**: `src/data/team.js` → `TEAM`. Cuidado: si renombras a alguien
  cuyo `id` (`m1`…`m8`) ya tiene votos guardados, los votos siguen
  asociados al `id`; sólo cambia el nombre visible. Si cambias el `id`,
  los votos huérfanos se quedan en KV hasta el TTL (1 año).
- **Trip key**: `src/data/team.js` → `TRIP_KEY`. Útil para reutilizar la
  app en próximos viajes con un bucket nuevo.

## Inspeccionar / borrar el KV

```bash
# Listar claves
npx wrangler kv key list --namespace-id <ID_DEL_NAMESPACE>

# Leer el bucket actual
npx wrangler kv key get pvfamilia2026 --namespace-id <ID>

# Borrar (reset total para todos)
npx wrangler kv key delete pvfamilia2026 --namespace-id <ID>
```

## Apuntar el frontend a otro Worker

Si por algún motivo decides separar API y app en dos Workers, define
`VITE_API_BASE` al hacer build:

```bash
VITE_API_BASE=https://otra-api.tu-cuenta.workers.dev npm run deploy
```

El cliente llamará a `${VITE_API_BASE}/api/votes`. Por defecto está vacío
= mismo origen (el propio Worker).

## Privacidad

- La trip key es **secreta por convención** (no hay autenticación). Quien
  la sepa puede leer/escribir el bucket. No publiques pantallazos con la
  key visible en la URL/bookmark.
- En KV sólo se guarda `{ byMember: { m1: [actId,…], … }, updatedAt }` —
  no hay nombres ni datos personales (los nombres viven en el código).
- TTL del bucket: 1 año desde la última escritura.
