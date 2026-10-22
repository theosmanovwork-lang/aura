export class DuplicateKeyError extends Error {
  constructor(collection: string, key: string) {
    super(`${collection}: key "${key}" already exists`);
    this.name = 'DuplicateKeyError';
  }
}

export class NotFoundError extends Error {
  constructor(collection: string, id: string) {
    super(`${collection}: id "${id}" not found`);
    this.name = 'NotFoundError';
  }
}
