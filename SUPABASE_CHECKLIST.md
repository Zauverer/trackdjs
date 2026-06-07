# Supabase Connection Checklist

Sprint 5A.2 deja todo listo para conectar credenciales reales sin rediseñar la app.

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

Esta migración agrega campos sociales/contacto con `alter table ... add column if not exists`; no borra datos y es segura para correr una vez o reintentar.

Los archivos son re-ejecutables en lo principal:

- `schema.sql` usa `if not exists`.
- `rls.sql` hace `drop policy if exists` antes de crear policies.
- `seed.sql` usa UUIDs fijos y `on conflict`.

## 3. Variables Locales

Crear `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```

No agregar service role al frontend.

```env
SUPABASE_SERVICE_ROLE_KEY=SOLO_BACKEND
```

## 4. Variables en Vercel

Vercel > Project > Settings > Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Solo cuando exista backend/server action:

- `SUPABASE_SERVICE_ROLE_KEY`

Después de agregar variables, redeploy.

## 5. Generar Tipos en Sprint 5B

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

## 6. Pruebas Manuales con Supabase Activo

### Login

- Abrir `/app/login`.
- Confirmar que ya no muestra mensaje de backend pendiente.
- Probar email/password cuando se conecten acciones reales.
- Confirmar que no bloquea navegación si falla.

### Signup

- Abrir `/app/signup`.
- Confirmar UI visible.
- Crear usuario cuando Auth esté conectado.
- Confirmar profile creado.

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

## 7. Migración localStorage

Sprint 5A.2 incluye stubs:

- `readLocalTrackSnapshot()`
- `prepareLocalTrackMigration()`
- `migrateLocalTrackToSupabaseDryRun()`

Sprint 5B debe:

- Ejecutar dry-run después de login.
- Mapear slugs locales a UUIDs Supabase.
- Insertar follows, seen DJs y event status con upserts.
- Marcar migración completada para no duplicar.

## 8. Validación

```bash
npm.cmd run lint
npm.cmd run build
```

Ambos deben pasar con y sin variables Supabase.
