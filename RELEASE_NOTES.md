# TrackDJs v0.1.1

## Qué cambia en v0.1.1

- Capa de datos en `/lib/data` para aislar mocks y preparar Supabase.
- Persistencia local centralizada con `useLocalStorage` y helpers de estado.
- `Mi Track` usa métricas reales sin inflar eventos asistidos.
- Badges desbloqueados por condiciones simples.
- Leaflet aislado del SSR con carga client-only y CSS global.
- Mapa GPS con fallback de carga y pins clickeables.
- `/app/upcoming` agrupado por mes y con scroll horizontal en móvil.
- Estados reutilizables: `EmptyState`, `ErrorState`, `LoadingState`, `SectionHeader`.
- `not-found` elegante para eventos y DJs inexistentes.
- Metadata por rutas principales, `robots.ts` y `sitemap.ts`.
- `DEPLOYMENT.md` y `.env.example`.

## Qué cambia en Production Launch Candidate

- Vercel Analytics integrado sin requerir variables de entorno.
- Capa `trackEvent()` preparada para eventos de producto.
- Página `/beta` para validar con usuarios, DJs y productoras.
- Contacto configurable inicial: `hello@trackdjs.com` y `@trackdjs`.
- `LAUNCH_CHECKLIST.md` para pre/post deploy.
- `FEEDBACK.md` para entrevistas beta.
- `DEPLOYMENT.md` ampliado con dominio canónico, SSL y checklist `trackdjs.com`.

## Auditoría npm

`npm audit` reporta 3 vulnerabilidades moderadas transitivas en `next/postcss`. El fix sugerido requiere `npm audit fix --force` y puede introducir cambios breaking, por lo que no se aplicó en este sprint. Revisar nuevamente al actualizar Next en el próximo ciclo.

## Sprint 5A — Supabase Foundation preparada

- Dependencias `@supabase/supabase-js` y `@supabase/ssr`.
- Clientes Supabase browser/server seguros con fallback si faltan env vars.
- `isSupabaseConfigured()` para detectar conexión.
- Repositorios base para DJs, eventos, perfiles y Mi Track.
- Rutas `/app/login`, `/app/signup` y `/app/admin` preparadas sin bloquear la app.
- SQL profesional en `supabase/schema.sql`.
- RLS policies en `supabase/rls.sql`.
- Seed reproducible en `supabase/seed.sql`.
- Documentación en `supabase/README.md`.
- La app sigue funcionando con mocks/localStorage sin Supabase.

## Sprint 5A.2 — Supabase Connection Readiness

- SQL revisado y reforzado con `updated_at` triggers.
- RLS idempotente con `drop policy if exists`.
- Índice único parcial para evitar duplicados de DJs vistos sin evento.
- Adapters `supabaseDJToDJ` y `supabaseEventToEvent`.
- Interfaces consistentes para repositorios.
- Nombres finales en repositorios: `getDJs`, `getDJBySlug`, `getEvents`, `getEventBySlug`, `getUpcomingEvents`.
- Stubs seguros para migración localStorage -> Supabase.
- `SUPABASE_CHECKLIST.md` con pasos exactos para credenciales reales.

## Sprint 6B — Contact & Social Profiles + Launch Prep

- Tipos ampliados para redes/contacto en usuarios, DJs, productoras y venues.
- Migración segura `supabase/2026_06_contact_social_fields.sql`.
- `SocialLinks` reutilizable sin renderizar URLs vacías ni `#`.
- `ContactPanel` reutilizable para DJ, productora y venue/local.
- Perfil DJ reforzado como LinkedIn artístico con redes, contacto, timeline y métricas.
- Perfiles de productoras y venues con contacto comercial, redes, eventos y frecuencias.
- Perfil usuario y `Mi Track` muestran Instagram, TikTok, Spotify y playlist destacada desde mocks.
- Search/feed muestran origen social y señales de contacto sin mezclar ticket/contacto.

## Qué incluye

- Landing pública con propuesta de valor, eventos destacados y mockup de `Mi Track`.
- App shell responsive con navegación inferior móvil.
- Rutas principales: inicio, explorar, eventos, detalle de evento, DJs, perfil de DJ, Mi Track y perfil.
- Mapa/timeline de eventos en `/app/events`, con fiestas de hoy y eventos futuros curados desde fuentes públicas.
- Datos mock locales para DJs, eventos, venues, productoras, usuarios, géneros y badges.
- Perfiles básicos de DJs agregados desde lineups públicos cuando existen; campos incompletos quedan vacíos.
- Persistencia en `localStorage` para seguir DJs, marcar DJs vistos, guardar eventos, marcar `Voy`, interés y asistencia.
- PWA mínima con manifest y favicon SVG.
- README con instrucciones de ejecución, build, Vercel y dominio.

## Qué no incluye

- Backend real.
- Supabase Auth o base de datos.
- Pagos, tickets, chat, booking o marketplace.
- Scraping de plataformas externas.
- Fotos reales de artistas.
- Panel administrativo.

## Bugs conocidos

- La búsqueda y filtros son visuales en v0.1; todavía no filtran resultados.
- La búsqueda textual sigue siendo visual; los chips de `/app/events` sí filtran por fecha, ciudad, formato y género.
- Los links externos de DJs son placeholders.
- El botón de editar perfil es visual.
- Compartir usa copia al portapapeles cuando el navegador lo permite.
- El mapa es esquemático, no usa todavía Google Maps/Mapbox.
- La Feria publica la fecha del sábado 06, pero no expone lineup en la fuente consultada.
- Creamfields Chile 2026 está confirmado, pero el lineup aún no fue anunciado en las fuentes consultadas.

## Próximo sprint

Supabase Auth, DB real, admin básico, perfiles editables, claim DJ profile, eventos reales por ciudad y analytics con PostHog.
