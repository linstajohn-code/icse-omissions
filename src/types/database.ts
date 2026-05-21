/**
 * Hand-written Supabase Database type matching supabase/migrations/0001_init.sql.
 *
 * Replace with auto-generated types in Phase 4 via:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 */

export type OmissionStatus = "omitted" | "included" | "partial";
export type UserRole = "student" | "teacher" | "admin";
export type ProgressStatus = "not_started" | "in_progress" | "revised";

export interface Database {
  public: {
    Tables: {
      subjects: {
        Row: {
          id: string;
          class_id: number;
          code: string;
          name: string;
          slug: string;
          subject_group: string;
        };
        Insert: Omit<Database["public"]["Tables"]["subjects"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["subjects"]["Insert"]>;
      };
      chapters: {
        Row: {
          id: string;
          subject_id: string;
          order: number;
          name: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["chapters"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["chapters"]["Insert"]>;
      };
      topics: {
        Row: {
          id: string;
          chapter_id: string;
          order: number;
          name: string;
          body_md: string | null;
          deleted_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["topics"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["topics"]["Insert"]>;
      };
      omissions: {
        Row: {
          id: string;
          topic_id: string;
          status: OmissionStatus;
          source_page: number;
          source_excerpt: string;
          cisce_circular_id: string | null;
          effective_session: string;
          notes_md: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["omissions"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["omissions"]["Insert"]>;
      };
      cisce_circulars: {
        Row: {
          id: string;
          title: string;
          url: string;
          sha256: string;
          published_at: string | null;
          storage_path: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["cisce_circulars"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["cisce_circulars"]["Insert"]>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          topic_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bookmarks"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["bookmarks"]["Insert"]>;
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          topic_id: string;
          status: ProgressStatus;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_progress"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["user_progress"]["Insert"]>;
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          topic_id: string;
          body_md: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notes"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["notes"]["Insert"]>;
      };
    };
    Views: {
      v_active_chapters: {
        Row: Database["public"]["Tables"]["chapters"]["Row"];
      };
      v_active_topics: {
        Row: Database["public"]["Tables"]["topics"]["Row"];
      };
      v_active_omissions: {
        Row: Database["public"]["Tables"]["omissions"]["Row"];
      };
    };
    Enums: {
      omission_status: OmissionStatus;
    };
  };
}
