'use server';

import { type API } from '@/apis/type';

import { SupabaseClient, createSupabaseClient } from './supabase';
import { toTeamBuildingInfo, toTeamInfo, toUserInfo } from './transform';

enum RoundStatus {
  START = 'START',
  FIRST_ROUND = 'FIRST_ROUND',
  SECOND_ROUND = 'SECOND_ROUND',
  THIRD_ROUND = 'THIRD_ROUND',
  FOURTH_ROUND = 'FOURTH_ROUND',
  ADJUSTED_ROUND = 'ADJUSTED_ROUND',
  COMPLETE = 'COMPLETE',
}
const getNextRoundStatus = (roundStatus: string) => {
  switch (roundStatus) {
    case RoundStatus.START:
      return RoundStatus.FIRST_ROUND;
    case RoundStatus.FIRST_ROUND:
      return RoundStatus.SECOND_ROUND;
    case RoundStatus.SECOND_ROUND:
      return RoundStatus.THIRD_ROUND;
    case RoundStatus.THIRD_ROUND:
      return RoundStatus.FOURTH_ROUND;
    case RoundStatus.FOURTH_ROUND:
      return RoundStatus.ADJUSTED_ROUND;
    case RoundStatus.ADJUSTED_ROUND:
      return RoundStatus.COMPLETE;
    default:
      throw new Error('Invalid round status');
  }
};

// GetTotalInfo
export const getTotalInfoAction = async (
  payload: API['getTotalInfo']['request'],
) => {
  const supabase = createSupabaseClient();
  const [teamBuilding, teams, users] = await Promise.all([
    getTeamBuilding(supabase, payload.teamBuildingUuid),
    getTeamsByTeamBuildingId(supabase, payload.teamBuildingUuid),
    getUsersByTeamBuildingId(supabase, payload.teamBuildingUuid),
  ]);

  return {
    teamBuildingInfo: toTeamBuildingInfo(teamBuilding),
    teamInfoList: teams.map((team) =>
      toTeamInfo(team, teamBuilding.round_status),
    ),
    userInfoList: users.map(toUserInfo),
  };
};

// SelectUsers
export const selectUsersAction = async (
  payload: API['selectUsers']['request'],
) => {
  const supabase = createSupabaseClient();
  const teamBuilding = await getTeamBuilding(
    supabase,
    payload.teamBuildingUuid,
  );
  const currentRound = teamBuilding.round_status;
  const { data: users, error: errorInUser } = await supabase
    .from('user')
    .upsert(
      payload.body.userUuids.map((userId) => ({
        id: userId,
        team_id: payload.teamUuid,
        team_building_id: payload.teamBuildingUuid,
        selected_round: currentRound,
      })),
    )
    .select('*, user_choice (*)');
  if (errorInUser) throw errorInUser;

  const nextRound = getNextRoundStatus(currentRound);
  const { error: errorInTeam } = await supabase
    .from('team')
    .update({
      round_status: nextRound,
    })
    .eq('id', payload.teamUuid);
  if (errorInTeam) throw errorInTeam;

  return { userInfoList: users.map(toUserInfo) };
};

// CreateTeamBuilding
export const createTeamBuildingAction = async (
  payload: API['createTeamBuilding']['request'],
) => {
  const supabase = createSupabaseClient();
  const teamBuilding = await createTeamBuilding(supabase, payload.body.name);
  const { error } = await supabase.from('team').insert(
    payload.body.teams.map((team) => ({
      name: team.name,
      pm_name: team.pmName,
      pm_position: team.pmPosition,
      team_building_id: teamBuilding.id,
      round_status: RoundStatus.START,
    })),
  );
  if (error) throw error;
  return toTeamBuildingInfo(teamBuilding);
};

// StartTeamBuilding
// - 팀 빌딩 정보를 start로 변경
export const startTeamBuildingAction = async (
  payload: API['startTeamBuilding']['request'],
) => {
  const supabase = createSupabaseClient();
  const { error: errorInTeamBuilding } = await supabase
    .from('team_building')
    .update({ round_status: RoundStatus.FIRST_ROUND })
    .eq('id', payload.teamBuildingUuid);
  if (errorInTeamBuilding) throw errorInTeamBuilding;

  const { error: errorInTeam } = await supabase
    .from('team')
    .update({
      round_status: RoundStatus.FIRST_ROUND,
    })
    .eq('team_building_id', payload.teamBuildingUuid);
  if (errorInTeam) throw errorInTeam;
};

// MoveToNextRound
// - 팀 빌딩 정보의 round_status를 다음 라운드로 변경
// TODO: admin 페이지에 연동 필요
export const moveToNextRoundAction = async (teamBuildingId: string) => {
  const supabase = createSupabaseClient();
  const teamBuilding = await getTeamBuilding(supabase, teamBuildingId);
  const currentRound = getNextRoundStatus(teamBuilding.round_status);
  const { error } = await supabase
    .from('team_building')
    .update({
      round_status: currentRound,
    })
    .eq('id', teamBuildingId);
  if (error) throw error;
};

// FinishTeamBuilding
export const finishTeamBuildingAction = async (
  payload: API['finishTeamBuilding']['request'],
) => {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from('team_building')
    .update({ round_status: RoundStatus.COMPLETE })
    .eq('id', payload.teamBuildingUuid);
  if (error) throw error;
};

// AdjustUser
export const adjustUserAction = async (
  payload: API['adjustUser']['request'],
) => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('user')
    .update({
      team_id: payload.body.teamUuid,
      selected_round: RoundStatus.ADJUSTED_ROUND,
    })
    .eq('id', payload.userUuid)
    .select('*, user_choice (*)');
  if (error) throw error;
  return toUserInfo(data[0]);
};

// DeleteUser
export const deleteUserAction = async (
  payload: API['deleteUser']['request'],
) => {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from('user')
    .delete()
    .eq('id', payload.userUuid);
  if (error) throw error;
};

// GetTotalInfoForSurvey
export const getTotalInfoForSurveyAction = async (
  payload: API['getTotalInfoForSurvey']['request'],
) => {
  const supabase = createSupabaseClient();
  const [teamBuilding, teams] = await Promise.all([
    getTeamBuilding(supabase, payload.teamBuildingUuid),
    getTeamsByTeamBuildingId(supabase, payload.teamBuildingUuid),
  ]);
  return {
    teamBuildingInfo: toTeamBuildingInfo(teamBuilding),
    teamInfoList: teams.map((team) =>
      toTeamInfo(team, teamBuilding.round_status),
    ),
  };
};

// CreateUser
export const createUserAction = async (
  payload: API['createUser']['request'],
) => {
  const supabase = createSupabaseClient();
  const { data: userData, error: errorInUser } = await supabase
    .from('user')
    .insert({
      team_building_id: payload.teamBuildingUuid,
      name: payload.body.name,
      position: payload.body.position,
      profile_link: payload.body.profileLink,
    })
    .select();
  if (errorInUser) throw errorInUser;

  const user = userData[0];
  const { data: userChoice, error: errorInUserChoice } = await supabase
    .from('user_choice')
    .insert(
      payload.body.choices.map((choice, order) => ({
        team_id: choice,
        user_id: user.id,
        choice_order: order,
      })),
    )
    .select();
  if (errorInUserChoice) throw errorInUserChoice;

  return toUserInfo({ ...user, user_choice: userChoice });
};

/// Helper functions

const getTeamBuilding = async (supabase: SupabaseClient, id: string) => {
  const { data, error } = await supabase
    .from('team_building')
    .select()
    .eq('id', id);
  if (error) throw error;
  if (data.length === 0) throw new Error('Team building not found');
  return data[0];
};

const getTeamsByTeamBuildingId = async (
  supabase: SupabaseClient,
  teamBuildingId: string,
) => {
  const { data, error } = await supabase
    .from('team')
    .select()
    .eq('team_building_id', teamBuildingId);
  if (error) throw error;
  return data;
};

const getUsersByTeamBuildingId = async (
  supabase: SupabaseClient,
  teamBuildingId: string,
) => {
  const { data, error } = await supabase
    .from('user')
    .select('*, user_choice (*)')
    .eq('team_building_id', teamBuildingId);
  if (error) throw error;
  return data;
};

const createTeamBuilding = async (supabase: SupabaseClient, name: string) => {
  const { data, error } = await supabase
    .from('team_building')
    .insert({
      name,
      round_status: RoundStatus.START,
    })
    .select();
  if (error) throw error;
  return data[0];
};
