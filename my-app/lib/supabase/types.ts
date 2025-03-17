export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            markers: {
                Row: {
                    id: string
                    name: string
                    latitude: number
                    longitude: number
                    address: string
                    fee_percentage: number
                    rating: number
                    description: string
                    created_at: string
                    image_url: string
                    type: string
                    created_by: string
                    phone: string
                }
                Insert: {
                    id?: string
                    name: string
                    latitude: number
                    longitude: number
                    address: string
                    fee_percentage: number
                    rating?: number
                    description: string
                    created_at?: string
                    image_url?: string
                    type: string
                    created_by: string
                    phone?: string
                }
                Update: {
                    id?: string
                    name?: string
                    latitude?: number
                    longitude?: number
                    address?: string
                    fee_percentage?: number
                    rating?: number
                    description?: string
                    created_at?: string
                    image_url?: string
                    type?: string
                    created_by?: string
                    phone?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "markers_created_by_fkey"
                        columns: ["created_by"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            reviews: {
                Row: {
                    id: string
                    marker_id: string
                    user_id: string
                    content: string
                    rating: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    marker_id: string
                    user_id: string
                    content: string
                    rating: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    marker_id?: string
                    user_id?: string
                    content?: string
                    rating?: number
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "reviews_marker_id_fkey"
                        columns: ["marker_id"]
                        referencedRelation: "markers"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "reviews_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            users: {
                Row: {
                    id: string
                    username: string
                    created_at: string
                    is_admin: boolean
                    points: number
                    last_login_date: string
                }
                Insert: {
                    id?: string
                    username: string
                    created_at?: string
                    is_admin?: boolean
                    points?: number
                    last_login_date?: string
                }
                Update: {
                    id?: string
                    username?: string
                    created_at?: string
                    is_admin?: boolean
                    points?: number
                    last_login_date?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// 편의성을 위한 타입 별칭
export type User = Tables<'users'>
export type Marker = Tables<'markers'>
export type Review = Tables<'reviews'>

export type InsertUser = InsertTables<'users'>
export type InsertMarker = InsertTables<'markers'>
export type InsertReview = InsertTables<'reviews'>

export type UpdateUser = UpdateTables<'users'>
export type UpdateMarker = UpdateTables<'markers'>
export type UpdateReview = UpdateTables<'reviews'> 