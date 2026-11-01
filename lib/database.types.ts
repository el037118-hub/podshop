export type Database = {
  public: {
    Tables: {
      categories: {
        Row: { created_at: string | null; id: string; name: string };
        Insert: { created_at?: string | null; id?: string; name: string };
        Update: { created_at?: string | null; id?: string; name?: string };
        Relationships: [];
      };
      customer_profiles: {
        Row: {
          address: string;
          created_at: string;
          full_name: string;
          observations: string;
          payment_method: string;
          phone: string;
          user_id: string;
        };
        Insert: {
          address?: string;
          created_at?: string;
          full_name?: string;
          observations?: string;
          payment_method?: string;
          phone?: string;
          user_id: string;
        };
        Update: {
          address?: string;
          created_at?: string;
          full_name?: string;
          observations?: string;
          payment_method?: string;
          phone?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          active: boolean;
          brand: string | null;
          category_id: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          image_url: string | null;
          name: string;
          price: number;
          stock: number;
        };
        Insert: {
          active?: boolean;
          brand?: string | null;
          category_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
          price?: number;
          stock?: number;
        };
        Update: {
          active?: boolean;
          brand?: string | null;
          category_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          price?: number;
          stock?: number;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type CustomerProfile = Database["public"]["Tables"]["customer_profiles"]["Row"];
