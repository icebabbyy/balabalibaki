export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      banners: {
        Row: {
          active: boolean
          created_at: string
          id: string
          image_url: string
          position: number
          updated_at: string | null
        }
        Insert: {
          active: boolean
          created_at?: string
          id?: string
          image_url: string
          position: number
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string
          position?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          display_on_homepage: boolean | null
          homepage_order: number | null
          id: number
          image: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          display_on_homepage?: boolean | null
          homepage_order?: number | null
          id?: number
          image?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          display_on_homepage?: boolean | null
          homepage_order?: number | null
          id?: number
          image?: string | null
          name?: string
        }
        Relationships: []
      }
      "email tracking": {
        Row: {
          created_at: string
          id: number
          message: string
          product_sku: string | null
          recipient_email: string
          send_at: string | null
          subject: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          message: string
          product_sku?: string | null
          recipient_email: string
          send_at?: string | null
          subject?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          message?: string
          product_sku?: string | null
          recipient_email?: string
          send_at?: string | null
          subject?: string | null
          type?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: number
          message: string
          order_id: number | null
          product_sku: string | null
          recipient_email: string
          sent_at: string | null
          subject: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          message: string
          order_id?: number | null
          product_sku?: string | null
          recipient_email: string
          sent_at?: string | null
          subject: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: number
          message?: string
          order_id?: number | null
          product_sku?: string | null
          recipient_email?: string
          sent_at?: string | null
          subject?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "publice_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "publine_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          admin_notes: string | null
          admin_read: boolean | null
          created_at: string | null
          deposit: number | null
          discount: number | null
          id: number
          items: Json
          notification_sent: boolean | null
          order_date: string | null
          payment_confirmed_at: string | null
          payment_date: string | null
          payment_slip: string | null
          payment_slip_url: string | null
          profit: number | null
          qr_code_generated: boolean | null
          shipping_cost: number | null
          status: string | null
          total_cost: number | null
          total_selling_price: number | null
          tracking_number: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          admin_read?: boolean | null
          created_at?: string | null
          deposit?: number | null
          discount?: number | null
          id?: number
          items: Json
          notification_sent?: boolean | null
          order_date?: string | null
          payment_confirmed_at?: string | null
          payment_date?: string | null
          payment_slip?: string | null
          payment_slip_url?: string | null
          profit?: number | null
          qr_code_generated?: boolean | null
          shipping_cost?: number | null
          status?: string | null
          total_cost?: number | null
          total_selling_price?: number | null
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          admin_read?: boolean | null
          created_at?: string | null
          deposit?: number | null
          discount?: number | null
          id?: number
          items?: Json
          notification_sent?: boolean | null
          order_date?: string | null
          payment_confirmed_at?: string | null
          payment_date?: string | null
          payment_slip?: string | null
          payment_slip_url?: string | null
          profit?: number | null
          qr_code_generated?: boolean | null
          shipping_cost?: number | null
          status?: string | null
          total_cost?: number | null
          total_selling_price?: number | null
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string | null
          id: number
          image_url: string
          index: number | null
          order: number | null
          product_id: number
          product_images: Json | null
          type: string
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          image_url: string
          index?: number | null
          order?: number | null
          product_id: number
          product_images?: Json | null
          type?: string
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          image_url?: string
          index?: number | null
          order?: number | null
          product_id?: number
          product_images?: Json | null
          type?: string
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          product_id: number
          tag_id: number
        }
        Insert: {
          product_id: number
          tag_id: number
        }
        Update: {
          product_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      product_types: {
        Row: {
          created_at: string | null
          id: number
          name: string
          shipping_fee: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          shipping_fee?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          shipping_fee?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          cost_thb: number
          created_at: string | null
          description: string | null
          exchange_rate: number
          extra: string | null
          id: number
          image: string
          import_cost: number
          link: string | null
          name: string
          options: Json | null
          price_yuan: number
          product_status: string | null
          product_type: string | null
          quantity: number
          selling_price: number
          shipment_date: string | null
          shipping_fee: string | null
          sku: string
          slug: string | null
          updated_at: string | null
          variant: string | null
        }
        Insert: {
          category: string
          cost_thb?: number
          created_at?: string | null
          description?: string | null
          exchange_rate?: number
          extra?: string | null
          id?: number
          image: string
          import_cost?: number
          link?: string | null
          name: string
          options?: Json | null
          price_yuan?: number
          product_status?: string | null
          product_type?: string | null
          quantity?: number
          selling_price?: number
          shipment_date?: string | null
          shipping_fee?: string | null
          sku: string
          slug?: string | null
          updated_at?: string | null
          variant?: string | null
        }
        Update: {
          category?: string
          cost_thb?: number
          created_at?: string | null
          description?: string | null
          exchange_rate?: number
          extra?: string | null
          id?: number
          image?: string
          import_cost?: number
          link?: string | null
          name?: string
          options?: Json | null
          price_yuan?: number
          product_status?: string | null
          product_type?: string | null
          quantity?: number
          selling_price?: number
          shipment_date?: string | null
          shipping_fee?: string | null
          sku?: string
          slug?: string | null
          updated_at?: string | null
          variant?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          birth_date: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          order_history: number | null
          phone: string | null
          role: string
          updated_at: string | null
          username: string | null
          wishlist: Json | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          order_history?: number | null
          phone?: string | null
          role?: string
          updated_at?: string | null
          username?: string | null
          wishlist?: Json | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          order_history?: number | null
          phone?: string | null
          role?: string
          updated_at?: string | null
          username?: string | null
          wishlist?: Json | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: number
          product_id: number
          product_images: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          product_id: number
          product_images?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          product_id?: number
          product_images?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: number | null
          image: string | null
          images_list: Json | null
          name: string | null
          options: Json | null
          product_status: string | null
          product_type: string | null
          quantity: number | null
          selling_price: number | null
          shipment_date: string | null
          shipping_fee: string | null
          sku: string | null
          slug: string | null
          tags: Json | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: number | null
          image?: string | null
          images_list?: never
          name?: string | null
          options?: Json | null
          product_status?: string | null
          product_type?: string | null
          quantity?: number | null
          selling_price?: number | null
          shipment_date?: string | null
          shipping_fee?: string | null
          sku?: string | null
          slug?: string | null
          tags?: never
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: number | null
          image?: string | null
          images_list?: never
          name?: string | null
          options?: Json | null
          product_status?: string | null
          product_type?: string | null
          quantity?: number | null
          selling_price?: number | null
          shipment_date?: string | null
          shipping_fee?: string | null
          sku?: string | null
          slug?: string | null
          tags?: never
          updated_at?: string | null
        }
        Relationships: []
      }
      publice_orders: {
        Row: {
          admin_notes: string | null
          deposit: number | null
          id: number | null
          item: string | null
          item_json: string | null
          order_date: string | null
          payment_date: string | null
          photo: string | null
          price: string | null
          qty: string | null
          sku: string | null
          status: string | null
          tracking_number: string | null
          username: string | null
        }
        Insert: {
          admin_notes?: string | null
          deposit?: number | null
          id?: number | null
          item?: never
          item_json?: never
          order_date?: string | null
          payment_date?: string | null
          photo?: never
          price?: never
          qty?: never
          sku?: never
          status?: string | null
          tracking_number?: string | null
          username?: string | null
        }
        Update: {
          admin_notes?: string | null
          deposit?: number | null
          id?: number | null
          item?: never
          item_json?: never
          order_date?: string | null
          payment_date?: string | null
          photo?: never
          price?: never
          qty?: never
          sku?: never
          status?: string | null
          tracking_number?: string | null
          username?: string | null
        }
        Relationships: []
      }
      publine_orders: {
        Row: {
          balance: number | null
          deposit: number | null
          id: number | null
          item: string | null
          item_json: string | null
          photo: string | null
          price: string | null
          qty: string | null
          sku: string | null
          status: string | null
          username: string | null
        }
        Insert: {
          balance?: number | null
          deposit?: number | null
          id?: number | null
          item?: never
          item_json?: never
          photo?: never
          price?: never
          qty?: never
          sku?: never
          status?: string | null
          username?: string | null
        }
        Update: {
          balance?: number | null
          deposit?: number | null
          id?: number | null
          item?: never
          item_json?: never
          photo?: never
          price?: never
          qty?: never
          sku?: never
          status?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      slugify: {
        Args: { v: string }
        Returns: string
      }
      update_main_image_via_view: {
        Args: { image_id: number; new_image_url: string }
        Returns: undefined
      }
      update_product_tags: {
        Args: { new_product_id: number; p_data: Json }
        Returns: undefined
      }
      upsert_product_with_relations: {
        Args: { p_data: Json }
        Returns: Json
      }
      upsert_product_with_tags: {
        Args: { p_data: Json }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
