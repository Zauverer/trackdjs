# TrackDJs Launch Checklist

## Pre-Deploy

- Ejecutar `npm install`.
- Ejecutar `npm run lint`.
- Ejecutar `npm run build`.
- Revisar `.env.example`.
- Confirmar que no hay secretos en el repo.
- Revisar `README.md`.
- Revisar `DEPLOYMENT.md`.
- Revisar `RELEASE_NOTES.md`.
- Si Supabase ya existe, ejecutar `supabase/2026_06_contact_social_fields.sql`.
- Si Supabase ya existe, ejecutar `supabase/2026_06_auth_profile_policies.sql`.
- Confirmar `NEXT_PUBLIC_SITE_URL` en local y Vercel.
- Confirmar Email provider enabled en Supabase Auth.
- Confirmar redirect URLs de `/auth/callback` en Supabase Auth.
- Confirmar que Google Auth sigue desactivado.
- Confirmar que Leaflet carga solo en cliente.
- Confirmar que Vercel Analytics no requiere configuración adicional.

## Deploy

- Elegir flujo: GitHub + Vercel o Vercel CLI.
- Si se usa GitHub, conectar repo a Vercel.
- Si se usa CLI, ejecutar `npx vercel`.
- Para producción, ejecutar `npx vercel --prod`.
- Configurar dominio `trackdjs.com`.
- Configurar `www.trackdjs.com`.
- Elegir dominio canónico.
- Validar SSL.
- Probar magic link en producción con `https://www.trackdjs.com/auth/callback`.

## Post-Deploy

- Abrir landing desde celular.
- Abrir `/login`, pedir magic link y entrar.
- Abrir `/signup`, pedir magic link y entrar.
- Confirmar que `/app/profile` muestra el perfil del usuario autenticado.
- Confirmar que `/u/[username]` muestra perfil público.
- Abrir `/app`.
- Abrir `/app/events`.
- Probar mapa y popups.
- Abrir detalle de evento desde popup.
- Abrir `/app/upcoming`.
- Abrir `/app/djs`.
- Abrir `/app/djs/amelie-lens` y confirmar SocialLinks/ContactPanel sin links vacíos.
- Abrir `/app/producers/ritual-cl` y confirmar correo, redes y eventos.
- Abrir `/app/venues/espacio-riesco` y confirmar dirección, capacidad, contacto y cómo llegar.
- Seguir un DJ.
- Marcar `Lo vi`.
- Guardar evento.
- Marcar `Voy`.
- Revisar `/app/my-track`.
- Revisar consola sin errores.
- Probar performance básica en Lighthouse.
- Compartir link con 5 usuarios beta.
- Recolectar feedback con `FEEDBACK.md`.
