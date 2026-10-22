export const ru = {
  counts: {
    thousand: 'тыс.',
    million: 'млн',
  },
  tabs: {
    feed: 'Лента',
    trends: 'Волны',
    wallet: 'Искры',
    profile: 'Профиль',
  },
  app: {
    loading: 'Загрузка…',
    storageError: 'Не удалось открыть данные приложения',
    retry: 'Повторить',
  },
  feed: {
    loading: 'Загружаем ленту…',
    error: 'Не удалось загрузить ленту',
    retry: 'Повторить',
    empty: 'Пока в ленте нет видео',
    aiBadge: 'Создано ИИ',
    like: 'Поставить лайк',
    unlike: 'Убрать лайк',
    pause: 'Пауза',
    resume: 'Продолжить',
    actionError: 'Не получилось. Попробуйте ещё раз',
    views: ['просмотр', 'просмотра', 'просмотров'],
  },
  screens: {
    trends: {
      title: 'Волны',
      subtitle: 'Скоро здесь появятся растущие тренды',
    },
    wallet: {
      title: 'Искры',
      subtitle: 'Скоро здесь появится ваш счёт искр',
    },
    profile: {
      title: 'Профиль',
      subtitle: 'Скоро здесь появится ваш профиль',
    },
  },
} as const;
