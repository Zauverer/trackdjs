# TrackDJs Supabase Setup

Sprint 5A deja Supabase preparado pero no conectado obligatoriamente. La app sigue funcionando con mocks/localStorage si faltan variables.

## Crear Proyecto

1. Entra a [Supabase](https://supabase.com).
2. Crea un nuevo proyecto.
3. Guarda la URL del proyecto y la anon key.

## Ejecutar SQL

En Supabase Dashboard:

1. Abre `SQL Editor`.
2. Ejecuta `supabase/schema.sql`.
3. Ejecuta `supabase/rls.sql`.
4. Ejecuta `supabase/seed.sql`.

## Variables Locales

Crea `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Opcional solo servidor/backend seguro:

```bash
SUPABASE_SERVICE_ROLE_KEY=
```

Nunca expongas `SUPABASE_SERVICE_ROLE_KEY` en frontend ni como `NEXT_PUBLIC_*`.

## Variables en Vercel

1. Vercel Project > Settings > Environment Variables.
2. Agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Agrega `SUPABASE_SERVICE_ROLE_KEY` solo cuando exista backend/server action que lo necesite.
4. Redeploy.

## Modo Fallback

Si las variables no existen:

- Landing funciona.
- `/beta` funciona.
- `/app/events` funciona con mocks.
- `/app/djs` funciona con mocks.
- `/app/my-track` funciona con localStorage.
- Login/signup/admin muestran estado pendiente.

## Sprint 5B

Conectar repositorios a Supabase de forma progresiva:

- Auth real.
- Perfiles.
- DJs seguidos.
- DJs vistos.
- Eventos guardados.
- Voy/Fui.
- Panel admin con writes seguros.

## Generar Tipos con Supabase CLI

Cuando existan credenciales reales:

```bash
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase gen types typescript --linked --schema public > lib/supabase/database.types.ts
```

Luego reemplazar o re-exportar `lib/supabase/types.ts` desde los tipos generados.

## Checklist Completo

Ver [../SUPABASE_CHECKLIST.md](../SUPABASE_CHECKLIST.md).
