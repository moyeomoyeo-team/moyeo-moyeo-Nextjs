export const getNextRound = (round: string) => {
  switch (round) {
    case 'START':
      return 'FIRST_ROUND';
    case 'FIRST_ROUND':
      return 'SECOND_ROUND';
    case 'SECOND_ROUND':
      return 'THIRD_ROUND';
    case 'THIRD_ROUND':
      return 'FOURTH_ROUND';
    case 'FOURTH_ROUND':
      return 'ADJUSTED_ROUND';
    case 'ADJUSTED_ROUND':
      return 'COMPLETE';
    default:
      throw new Error('Invalid round status');
  }
};
