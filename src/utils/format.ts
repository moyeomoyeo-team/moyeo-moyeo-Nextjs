export const toLocaleString = (date: string) => {
  if (!date) return '';

  return new Date(date).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
  });
};
