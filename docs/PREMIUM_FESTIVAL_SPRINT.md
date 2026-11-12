# TrackDJs — Premium Festival Dashboard + email-only Save (Sprint)

## Scope
- Hero redesigned as original, lightweight audiovisual stage motion with a premium interactive control dashboard. No third-party festival footage or artist logos are copied.
- Primary **Bezel** controller: rotary interaction by touch/pointer, accessible numbered nodes + previous/next controls; selected stage filters the gallery. Alternates implemented: **Rail** (compact stage tiles). The existing **Timeline/Animation** remains a third navigation route, accessible lower on page.
- Day selector plus explicit "Seleccionar fiesta" links Creamfields to the legacy global event catalog at `/app/events`; no fake festival datasets.
- Cards gain CSS lighting animations tailored to genre (techno, house, EDM, melodic); **prefers-reduced-motion** disables animated effects, no audio used, no aggressive strobe.
- Removed emojis from key UI controls; preserved Lucide icons.
- Guest can create, match/share and export without account. The **Guardar mi selección** action opens a special modal with email magic link and separate, affirmative cloud consent.
- Migration `supabase/creamfields_lineups.sql` creates user-owned festival lineups with RLS and version/timestamps. No implicit localStorage writes; previously saved beta picks can be recovered once.
- Old app remains at `/app`, event selection at `/app/events`.

## Activation — do not skip
1. Verify app owner's full legal identity, approve current versions of `/privacy` and `/beta/terms` with legal counsel and publish contact.
2. Confirm Supabase project and `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel, never a service-role key in client.
3. Apply and review `supabase/creamfields_lineups.sql` in the intended Supabase project, ensure `profiles` table and its RLS policies are set up.
4. Supabase Dashboard > Authentication > URL Configuration: configure `https://www.trackdjs.com/auth/callback` and verified preview redirect URLs as needed; check email service and delivery.
5. QA email-only registration with real authorized account, link from same and different devices, consent not preselected, privacy mode untouched until explicit choice, owner-only reads, delete request, revoked beta, anonymous view with no Supabase network call.
6. Once verified, set `NEXT_PUBLIC_FESTIVAL_SAVE_ENABLED=true` in Vercel and redeploy. **Default is OFF** for security.
7. Keep issues in GitHub until QA resolves. Never claim live saving before all above are verified.

## Alternative UX treatments
- **A · Bezel** (implemented default): elegant radial selector with haptics-like visual movement, six stage nodes; users drag clockwise or use arrows.
- **B · Rail** (implemented toggle): horizontal/compact stage tile navigator for accessibility and discoverability, no gestural requirement.
- **C · Immersive timeline** (existing): scene progresses through the day and DJs by time, mobile-first; complementary rather than replacing the planner.

## Definition of Done
- TypeScript, lint, build, accessible keyboard & touch behavior and contrast pass.
- Stage selector remains consistent when changing day.
- Gallery is responsive in 360px and 768px widths.
- Reduced-motion is honored.
- No copywritten festival music, third-party photos, or unlicensed stage footage.
- Browser and Supabase guest privacy are distinguished accurately.
- Cloud saving remains disabled until manually activated after backend and policy readiness.

## Notes
The website `https://map-ai-portfolio.vercel.app/` could not be inspected from the available environment during this sprint; this implementation uses the user's described dashboard, progress and bezel qualities rather than claiming a visual reconstruction of the website.
