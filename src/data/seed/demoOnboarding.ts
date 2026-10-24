/** Made-up data for the welcome flow: nicknames that are already taken and the pre-chosen interests. */
export const takenNicknames: readonly string[] = ['kira', 'denis_f', 'lulu.mp4', 'sasha.v'];

export const startInterests: readonly string[] = ['Мемы', 'Авто', 'Музыка', 'Котики', 'Закаты'];

export const NICKNAME_PATTERN = /^[a-z0-9._]{3,20}$/i;
export const MIN_INTERESTS = 3;
export const MIN_AGE = 13;
export const ADULT_AGE = 18;
export const DEFAULT_BIRTH = { day: 14, month: 3, year: 2006 } as const;
export const FIRST_YEAR = 1950;
export const LAST_YEAR = 2020;
