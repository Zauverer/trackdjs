# TrackDJs Deployment

## Deploy con GitHub + Vercel

1. Crea un repositorio en GitHub.
2. Si Git está disponible, sube el proyecto:
   ```bash
   git init
   git add .
   git commit -m "Initial TrackDJs launch candidate"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/trackdjs.git
   git push -u origin main
   ```
3. Si Git no está disponible en esta máquina, instala Git para Windows o sube el proyecto desde GitHub Desktop/VS Code.
4. En Vercel, selecciona `Add New > Project`.
5. Importa el repositorio.
6. Usa el preset `Next.js`.
7. Build command: `npm run build`.
8. Output directory: default.
9. Deploy.

Cada push a GitHub generará un deploy preview. Úsalo para revisar cambios desde el celular con una URL pública.

## Deploy rápido con Vercel CLI

```bash
npx vercel
```

La primera vez Vercel pedirá login, scope y vincular/crear proyecto. No compartas tokens ni credenciales en la app.

## Deploy producción

```bash
npx vercel --prod
```

## Variables de entorno

La versión actual funciona con fallback mock/localStorage. Si Supabase está conectado, configurar:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Solo para backend seguro:

```text
SUPABASE_SERVICE_ROLE_KEY
```

Nunca usar `SUPABASE_SERVICE_ROLE_KEY` en frontend.

## Supabase antes de producción

Si ya ejecutaste `schema.sql`, `rls.sql` y `seed.sql` antes de Sprint 6B, abre Supabase Dashboard > SQL Editor y ejecuta:

```sql
-- archivo local
supabase/2026_06_contact_social_fields.sql
```

Esto agrega campos sociales/contacto a `profiles`, `djs`, `producers` y `venues` sin borrar datos.

## Comandos Windows

```bash
npm.cmd install
npm.cmd run dev
npm.cmd run build
npm.cmd start
```

Para ver en celular dentro de la misma Wi-Fi:

```bash
npm.cmd run dev -- --hostname 0.0.0.0 --port 3000
```

Luego abre la IP local del computador, por ejemplo:

```text
http://192.168.100.21:3000
```

## DNS para trackdjs.com

1. En Vercel, abre `Settings > Domains`.
2. Agrega `trackdjs.com`.
3. Agrega `www.trackdjs.com`.
4. Copia los registros que Vercel indique.
5. En tu proveedor DNS:
   - Crea/actualiza `A` para `@` con el valor que entregue Vercel.
   - Crea/actualiza `CNAME` para `www` con el valor que entregue Vercel.
6. Elige una versión canónica. Recomendación: `trackdjs.com` como dominio principal y `www.trackdjs.com` redirigiendo al root.
7. En Vercel, marca `trackdjs.com` como Primary Domain.
8. Espera propagación DNS.
9. Verifica `Valid Configuration` en Vercel.
10. Verifica que el certificado SSL esté activo.
11. Abre `https://trackdjs.com`.

## Checklist trackdjs.com

- `https://trackdjs.com` carga landing.
- `https://www.trackdjs.com` redirige correctamente al dominio canónico.
- `/app` carga.
- `/app/events` carga mapa GPS.
- `/app/upcoming` carga timeline.
- `/app/my-track` refleja localStorage.
- `/app/djs/amelie-lens` muestra redes sin links vacíos.
- `/app/producers/ritual-cl` muestra contacto comercial.
- `/app/venues/espacio-riesco` muestra dirección, redes y cómo llegar.
- No hay errores visibles en consola.
- SSL válido en navegador.

## Checklist Post-Deploy

- Abrir `/`.
- Abrir `/app`.
- Abrir `/app/events` y confirmar mapa GPS.
- Pinchar un pin y abrir detalle de evento.
- Abrir `/app/upcoming`.
- Marcar un DJ como visto y revisar `/app/my-track`.
- Guardar un evento y revisar `/app/my-track`.
- Revisar consola sin errores.
- Revisar mobile desde celular real.
