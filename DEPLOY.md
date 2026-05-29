# Despliegue — sincronización compartida de votos

La app despliega como un proyecto **Cloudflare Pages** con una **Pages
Function** (`functions/api/votes.js`) que guarda los votos en un **KV
Namespace**. Cada navegador escribe sólo su propio miembro; el endpoint
mergea, así que dos personas pueden votar a la vez sin pisarse.

## Paso 1 — crear el KV namespace (una sola vez)

Con [wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
ya instalado y logueado (`npx wrangler login`):

```bash
npx wrangler kv namespace create VOTES_KV
# Anota el "id" devuelto.
npx wrangler kv namespace create VOTES_KV --preview
# Anota el "preview_id" devuelto.
```

Alternativa por dashboard: **Workers & Pages → KV → Create namespace** y le
pones `VOTES_KV` de nombre.

## Paso 2 — bindear el KV al proyecto de Pages

En Cloudflare:

1. **Workers & Pages → tu proyecto Pages (french-basque-family-trip)**.
2. **Settings → Functions → KV namespace bindings → Add binding**.
3. Variable name: **`VOTES_KV`** (exacto, así lo lee el Pages Function).
4. KV namespace: selecciona el creado en el paso 1.
5. Repite para el entorno **Preview** si lo usas.
6. **Save**.

## Paso 3 — redeploy

Empuja un cambio (o "Retry deployment" en Cloudflare). Tras desplegarse:

- `GET /api/votes?trip=pvfamilia2026` → debería devolver `{ "byMember": {}, "updatedAt": null }`.
- Abrir la app, elegir tu persona, votar algo en una actividad. Refrescar otro navegador: deberías ver el voto.

## Cambiar la trip key o los nombres del equipo

- **Nombres**: `src/data/team.js` → `TEAM`. Cuidado: si renombras a alguien
  cuyo `id` (`m1`…`m8`) ya tiene votos guardados, los votos siguen
  asociados al `id`, sólo cambia el nombre visible. Si cambias el `id`,
  los votos huérfanos se quedan en KV hasta el TTL (1 año) o hasta que se
  borre manualmente.
- **Trip key**: `src/data/team.js` → `TRIP_KEY`. Cámbiala para empezar un
  bucket nuevo (útil para próximos viajes).

## Borrar / inspeccionar el KV

```bash
# Listar claves
npx wrangler kv key list --namespace-id <ID_DEL_NAMESPACE>

# Leer el bucket actual
npx wrangler kv key get pvfamilia2026 --namespace-id <ID>

# Borrar (reset total para todos)
npx wrangler kv key delete pvfamilia2026 --namespace-id <ID>
```

## Apuntar a un Worker externo (opcional)

Si prefieres servir la API desde otro Worker (no Pages Functions), define
`VITE_API_BASE` al hacer build:

```bash
VITE_API_BASE=https://fbt-votes.tu-cuenta.workers.dev npm run build
```

El cliente llamará a `${VITE_API_BASE}/api/votes`. Por defecto es vacío =
mismo origen (Pages Functions).

## Privacidad

- La trip key es **secreta por convención** (no hay autenticación). Cualquiera
  que la sepa puede leer/escribir el bucket. No publiques pantallazos con
  la key visible en el bookmark / URL.
- Lo que se guarda en KV: solo `{ byMember: { m1: [actId,…], … }, updatedAt }`.
  No hay nombres ni datos personales en KV (los nombres viven en el código).
- TTL del bucket: 1 año desde la última escritura.
