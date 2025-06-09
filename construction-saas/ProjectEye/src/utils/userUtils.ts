export const formatUserName = (firstName: string, lastName?: string): string => {
  return `${firstName}${lastName ? ` ${lastName}` : ''}`;
};