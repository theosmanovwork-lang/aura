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

describe('interface texts', () => {
  test('there are texts to check', () => {
    expect(collect(ru).length).toBeGreaterThan(80);
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
