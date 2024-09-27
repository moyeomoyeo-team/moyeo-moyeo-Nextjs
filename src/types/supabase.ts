export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      team: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          pm_name: string;
          pm_position: string;
          round_status: string;
          team_building_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          pm_name: string;
          pm_position: string;
          round_status: string;
          team_building_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          pm_name?: string;
          pm_position?: string;
          round_status?: string;
          team_building_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'team_team_building_id_fkey';
            columns: ['team_building_id'];
            isOneToOne: false;
            referencedRelation: 'team_building';
            referencedColumns: ['id'];
          },
        ];
      };
      team_building: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          round_status: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name?: string;
          round_status?: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          round_status?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      user: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          position: string;
          profile_link: string;
          selected_round: string | null;
          team_building_id: string | null;
          team_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name?: string;
          position?: string;
          profile_link?: string;
          selected_round?: string | null;
          team_building_id?: string | null;
          team_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          position?: string;
          profile_link?: string;
          selected_round?: string | null;
          team_building_id?: string | null;
          team_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_team_building_id_fkey';
            columns: ['team_building_id'];
            isOneToOne: false;
            referencedRelation: 'team_building';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'team';
            referencedColumns: ['id'];
          },
        ];
      };
      user_choice: {
        Row: {
          choice_order: number;
          created_at: string;
          id: number;
          team_id: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          choice_order: number;
          created_at?: string;
          id?: number;
          team_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          choice_order?: number;
          created_at?: string;
          id?: number;
          team_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_choice_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'team';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_choice_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;
