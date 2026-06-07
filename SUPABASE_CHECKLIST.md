# Supabase Connection Checklist

Sprint 7A conecta Supabase Auth con Email Magic Link sin rediseñar la app ni activar Google.

## 1. Crear Proyecto

- Entrar a [Supabase](https://supabase.com).
- Crear un proyecto nuevo.
- Guardar:
  - Project URL.
  - anon public key.
  - service role key solo para backend seguro.

## 2. Ejecutar SQL

En Supabase Dashboard > SQL Editor:

1. Ejecutar `supabase/schema.sql`.
2. Ejecutar `supabase/rls.sql`.
3. Ejecutar `supabase/seed.sql`.

Si el proyecto ya existe y `schema.sql` ya fue ejecutado antes de Sprint 6B, ejecutar además:

4. Ejecutar `supabase/2026_06_contact_social_fields.sql`.
5. Ejecutar `supabase/2026_06_auth_profile_policies.sql`.
6. Ejecutar `supabase/2026_06_user_dj_wishlist.sql`.
7. Ejecutar `supabase/2026_06_set_reminders.sql`.
8. Ejecutar `supabase/2026_06_user_actions_rls.sql`.
9. Ejecutar `supabase/2026_06_seen_dj_medal_activity.sql`.

Estas migraciones agregan campos sociales/contacto y el campo `email` en `profiles` con `alter table ... add column if not exists`; no borran datos y son seguras para correr una vez o reintentar.

Los archivos son re-ejecutables en lo principal:

- `schema.sql` usa `if not exists`.
- `rls.sql` hace `drop policy if exists` antes de crear policies.
- `seed.sql` usa UUIDs fijos y `on conflict`.

## 3. Variables Locales

Crear `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

No agregar service role al frontend.

```env
SUPABASE_SERVICE_ROLE_KEY=SOLO_BACKEND
```

## 4. Variables en Vercel

Vercel > Project > Settings > Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

Solo cuando exista backend/server action:

- `SUPABASE_SERVICE_ROLE_KEY`

Después de agregar variables, redeploy.

## 5. Supabase Auth Magic Link

En Supabase Dashboard > Authentication:

- Email provider: `Enabled`.
- Site URL producción: `https://www.trackdjs.com`.
- Redirect URLs permitidas:
  - `https://www.trackdjs.com/auth/callback`
  - `https://trackdjs.com/auth/callback`
  - `https://trackdjs.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback`

El flujo actual usa `/login` y `/signup` con magic link por email. No activar Google todavía.

## 6. Generar Tipos

Instalar/login CLI:

```bash
npx supabase login
```

Vincular proyecto:

```bash
npx supabase link --project-ref TU_PROJECT_REF
```

Generar tipos:

```bash
npx supabase gen types typescript --linked --schema public > lib/supabase/database.types.ts
```

Luego reemplazar el tipo manual de `lib/supabase/types.ts` por tipos generados o re-exportarlos desde `database.types.ts`.

## 7. Pruebas Manuales con Supabase Activo

### Login

- Abrir `/login`.
- Ingresar email válido.
- Confirmar que Supabase envía el magic link.
- Abrir el enlace y confirmar redirección a `/auth/callback`.
- Confirmar llegada a `/app/profile`.

### Signup

- Abrir `/signup`.
- Ingresar email válido.
- Confirmar que el perfil se crea o actualiza después del callback.
- Confirmar que `/app/login` y `/app/signup` redirigen a las rutas nuevas.

### Admin

- Abrir `/app/admin`.
- Sin usuario admin: acceso restringido.
- Con usuario admin: ver secciones DJs, Eventos, Venues, Productoras.
- No permitir writes desde frontend sin RLS correcta.

### Datos

- `/app/events` debe leer Supabase si hay datos.
- Si Supabase falla, debe caer a mocks.
- `/app/djs` debe leer Supabase si hay datos.
- `/app/djs/[slug]` debe mostrar redes/contacto si corriste `supabase/2026_06_contact_social_fields.sql`.
- `/app/producers/[slug]` debe mostrar correo, teléfono, web e Instagram/TikTok cuando existan.
- `/app/venues/[slug]` debe mostrar dirección, capacidad, contacto, redes y cómo llegar.
- `/app/my-track` debe seguir usando localStorage hasta migración post-login.
- `/u/[username]` debe leer el perfil público real si Supabase está configurado.
- `/u/[username]` debe mostrar Medal Rack desde `public_profile_seen_djs`.
- `/app/debug/user-actions` debe mostrar solo actividad propia del usuario logueado.

## 8. Migración localStorage

Sprint 7B activa decisión persistente de migración:

- `trackdjs_migration_dismissed_at`
- `trackdjs_migration_saved_at`
- `trackdjs_migration_last_hash`
- `trackdjs_migration_choice`

Prueba esperada:

- Si eliges `Después`, el modal no reaparece por 24 horas para el mismo hash.
- Si eliges `No guardar`, no reaparece para el mismo hash.
- Si eliges `Guardar`, hace upsert de follows, DJs vistos, wishlist y estados de evento sin borrar localStorage hasta confirmar éxito.
- Si cambia la actividad local, cambia el hash y puede volver a preguntar.

## 9. QA Medal Rack

- Entrar con magic link.
- Marcar `Lo vi` en un DJ.
- Abrir `/app/my-track` y confirmar medalla con DJ, año, bandera/código y estado `autodeclarado`.
- Abrir `/u/[username]` y confirmar que la medalla aparece pública.
- Si hay `event_id` en `user_seen_djs`, la view debe mostrar `event_name` y `seen_year` desde `events.starts_at`.

## 10. Validación

```bash
npm.cmd run lint
npm.cmd run build
```

Ambos deben pasar con y sin variables Supabase.
