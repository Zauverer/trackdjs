import { CheckCircle2, Mail, Phone, ShieldAlert } from "lucide-react";
import { SocialLinks, type SocialLinkSet } from "@/components/social-links";

type ContactPanelProps = {
  title?: string;
  entityType: "dj" | "producer" | "venue";
  contactEnabled?: boolean;
  email?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  tiktok?: string;
  mapUrl?: string;
};

export function ContactPanel({
  title = "Contacto",
  entityType,
  contactEnabled,
  email,
  phone,
  website,
  instagram,
  tiktok,
  mapUrl,
}: ContactPanelProps) {
  const links: SocialLinkSet = {
    contact_email: email,
    contact_phone: phone,
    website_url: website,
    instagram_url: instagram,
    tiktok_url: tiktok,
    map_url: mapUrl,
  };

  const isDjDisabled = entityType === "dj" && !contactEnabled;
  const hasCommercialContact = Boolean(email || phone || website || instagram || tiktok || mapUrl);

  return (
    <aside className="glass rounded-lg p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan">{title}</p>
          <h3 className="mt-1 text-xl font-black text-white">
            {entityType === "dj" ? "Contacto artístico" : "Contacto comercial"}
          </h3>
        </div>
        {isDjDisabled ? (
          <ShieldAlert className="text-muted" size={20} />
        ) : (
          <CheckCircle2 className="text-success" size={20} />
        )}
      </div>

      {isDjDisabled ? (
        <p className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 text-sm font-bold text-muted">
          Contacto no disponible
        </p>
      ) : hasCommercialContact ? (
        <div className="mt-4 space-y-3">
          {email ? <p className="flex items-center gap-2 text-sm text-zinc-300"><Mail size={15} /> {email}</p> : null}
          {phone ? <p className="flex items-center gap-2 text-sm text-zinc-300"><Phone size={15} /> {phone}</p> : null}
          <SocialLinks links={links} compact />
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">Contacto pendiente de completar por el equipo o representante.</p>
      )}
    </aside>
  );
}
