import { ru } from '../../src/i18n/ru';

// Node's file tools, described by hand: the project does not load Node's types for the app code.
const { readdirSync, readFileSync, statSync } = jest.requireActual('fs') as {
  readdirSync(dir: string): string[];
  readFileSync(path: string, encoding: 'utf8'): string;
  statSync(path: string): { isDirectory(): boolean };
};
const { join } = jest.requireActual('path') as { join(...parts: string[]): string };

const collect = (value: unknown, out: string[] = []): string[] => {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collect(item, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collect(v, out));
  return out;
};

/** True when a word in the text STARTS with the stem (so "поставить" does not match "став"). */
const hasWordStartingWith = (text: string, stem: string): boolean =>
  new RegExp(`(^|[^а-яё])${stem}`, 'i').test(text);

/** Words that suggest real money, bets or prizes. None may appear in any interface text. */
const FORBIDDEN_STEMS = [
  'став(к|и|л|ить|ят)',
  'выигр',
  'выигра',
  'проигр',
  'деньг',
  'денег',
  'рубл',
  'руб\\.',
  'приз',
  'платеж',
  'платёж',
  'оплат',
  'заработ',
  'крипт',
  'пополн',
  'вклад',
  'инвест',
  'кошелек',
];

/** These may appear only to say what sparks CANNOT do ("нельзя купить, вывести или обменять"). */
const ONLY_WITH_A_NEGATION = ['купи', 'вывест', 'вывод', 'обмен', 'продат', 'продаж'];

describe('interface texts', () => {
  const texts = collect(ru);

  test('there are texts to check', () => {
    expect(texts.length).toBeGreaterThan(80);
  });

  test.each(FORBIDDEN_STEMS)('no text has a word starting with "%s"', (stem) => {
    expect(texts.filter((text) => hasWordStartingWith(text, stem))).toEqual([]);
  });

  test.each(ONLY_WITH_A_NEGATION)('"%s" appears only together with "нельзя"', (stem) => {
    const offenders = texts.filter(
      (text) => hasWordStartingWith(text, stem) && !text.toLowerCase().includes('нельзя'),
    );
    expect(offenders).toEqual([]);
  });

  test('the symbols for money are not used', () => {
    expect(texts.filter((text) => /[₽$€£¥]/.test(text))).toEqual([]);
  });
});

describe('texts written directly in code', () => {
  const roots = ['app', 'src'];
  /** The only places where Russian text may live. */
  const allowed = [
    join('src', 'i18n', 'ru.ts'),
    join('src', 'data', 'seed'),
    join('src', 'data', 'testing'), // test-only helpers
  ];

  /** Comments may mention Russian examples; only real code (strings) is checked. */
  const withoutComments = (code: string): string =>
    code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((name: string) => {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) return files(path);
      return /\.(ts|tsx)$/.test(name) ? [path] : [];
    });

  test('Russian words are only in src/i18n/ru.ts (and the demo content), never in components', () => {
    const offenders = roots
      .flatMap((root) => files(join(process.cwd(), root)))
      .map((path) => path.replace(`${process.cwd()}/`, ''))
      .filter((path) => !allowed.some((ok) => path.startsWith(ok)))
      .filter((path) => /[а-яё]/i.test(withoutComments(readFileSync(path, 'utf8'))));

    expect(offenders).toEqual([]);
  });
});
