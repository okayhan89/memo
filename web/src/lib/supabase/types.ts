// Hand-rolled DB types. Replace with `supabase gen types typescript` output once the
// project is linked. Optional fields mirror SQL defaults so inserts stay terse.

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          locale: string;
          theme: 'light' | 'dark' | 'system';
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      folders: {
        Row: {
          id: string;
          owner_id: string;
          parent_id: string | null;
          name: string;
          color: string | null;
          sort_order: number;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['folders']['Row']> & {
          owner_id: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['folders']['Row']>;
        Relationships: [];
      };
      notes: {
        Row: {
          id: string;
          owner_id: string;
          folder_id: string | null;
          title: string;
          content_json: unknown;
          content_text: string;
          is_pinned: boolean;
          is_favorite: boolean;
          deleted_at: string | null;
          edited_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['notes']['Row']> & { owner_id: string };
        Update: Partial<Database['public']['Tables']['notes']['Row']>;
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          color: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['tags']['Row']> & {
          owner_id: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['tags']['Row']>;
        Relationships: [];
      };
      note_tags: {
        Row: {
          note_id: string;
          tag_id: string;
          owner_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['note_tags']['Row'], 'created_at'> & {
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['note_tags']['Row']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type NoteRow = Database['public']['Tables']['notes']['Row'];
export type FolderRow = Database['public']['Tables']['folders']['Row'];
export type TagRow = Database['public']['Tables']['tags']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
