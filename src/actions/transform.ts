import { Position, Round, Team, TeamBuilding, User } from '@/types';
import { Database } from '@/types/supabase';

// transform
export const toTeamBuildingInfo = (
  team_building: Database['public']['Tables']['team_building']['Row'],
): TeamBuilding => {
  return {
    teamBuildingUrl: team_building.id,
    teamBuildingName: team_building.name,
    roundStatus: team_building.round_status as Round,
  };
};

export const toTeamInfo = (
  team: Database['public']['Tables']['team']['Row'],
  currentRound: string,
): Team => {
  return {
    uuid: team.id,
    teamName: team.name,
    pmName: team.pm_name,
    pmPosition: team.pm_position as Position,
    selectDone: team.round_status !== currentRound,
  };
};

export const toUserInfo = (
  data: Database['public']['Tables']['user']['Row'] & {
    user_choice: Database['public']['Tables']['user_choice']['Row'][];
  },
): User => {
  return {
    uuid: data.id,
    userName: data.name,
    position: data.position as Position,
    choices: data.user_choice
      .sort((a, b) => a.choice_order - b.choice_order)
      .map((choice) => choice.team_id)
      .filter(isNotNull),
    joinedTeamUuid: data.team_id,
    profileLink: data.profile_link,
    selectedRound: data.selected_round as Round,
    createdDate: data.created_at,
  };
};

const isNotNull = <T>(value: T | null): value is T => value !== null;
