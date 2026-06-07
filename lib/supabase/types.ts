export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          username: string | null;
          full_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          city: string | null;
          bio: string | null;
          favorite_genres: string[] | null;
          instagram_url: string | null;
          tiktok_url: string | null;
          spotify_url: string | null;
          spotify_playlist_url: string | null;
          website_url: string | null;
          public_contact_enabled: boolean;
          role: "fan" | "dj" | "producer" | "venue" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      djs: {
        Row: {
          id: string;
          slug: string;
          artist_name: string;
          real_name: string | null;
          country: string | null;
          city: string | null;
          bio: string | null;
          photo_url: string | null;
          genres: string[] | null;
          instagram_url: string | null;
          tiktok_url: string | null;
          soundcloud_url: string | null;
          spotify_url: string | null;
          youtube_url: string | null;
          website_url: string | null;
          contact_email: string | null;
          contact_enabled: boolean;
          verified: boolean;
          claimed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["djs"]["Row"]> & { slug: string; artist_name: string };
        Update: Partial<Database["public"]["Tables"]["djs"]["Row"]>;
        Relationships: [];
      };
      venues: {
        Row: {
          id: string;
          slug: string | null;
          name: string;
          city: string | null;
          comuna: string | null;
          address: string | null;
          lat: number | null;
          lng: number | null;
          map_url: string | null;
          instagram_url: string | null;
          tiktok_url: string | null;
          website_url: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          capacity: number | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["venues"]["Row"]> & { name: string };
        Update: Partial<Database["public"]["Tables"]["venues"]["Row"]>;
        Relationships: [];
      };
      producers: {
        Row: {
          id: string;
          slug: string | null;
          name: string;
          city: string | null;
          comuna: string | null;
          instagram_url: string | null;
          tiktok_url: string | null;
          website_url: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          description: string | null;
          verified: boolean;
          claimed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["producers"]["Row"]> & { name: string };
        Update: Partial<Database["public"]["Tables"]["producers"]["Row"]>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          starts_at: string;
          ends_at: string | null;
          city: string | null;
          venue_id: string | null;
          producer_id: string | null;
          address: string | null;
          lat: number | null;
          lng: number | null;
          ticket_url: string | null;
          event_type: string | null;
          genres: string[] | null;
          status: "upcoming" | "live" | "finished" | "cancelled";
          cover_image_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["events"]["Row"]> & { slug: string; name: string; starts_at: string };
        Update: Partial<Database["public"]["Tables"]["events"]["Row"]>;
        Relationships: [];
      };
      user_seen_djs: {
        Row: {
          id: string;
          user_id: string;
          dj_id: string;
          seen_at: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_seen_djs"]["Row"]> & { user_id: string; dj_id: string };
        Update: Partial<Database["public"]["Tables"]["user_seen_djs"]["Row"]>;
        Relationships: [];
      };
      user_event_status: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          status: "interested" | "going" | "attended" | "skipped";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_event_status"]["Row"]> & { user_id: string; event_id: string; status: "interested" | "going" | "attended" | "skipped" };
        Update: Partial<Database["public"]["Tables"]["user_event_status"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
