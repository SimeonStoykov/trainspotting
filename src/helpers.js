export const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000);
};

export const padWithZero = (value) => {
  if (value < 10) {
    return '0' + value;
  }
  return value;
};
