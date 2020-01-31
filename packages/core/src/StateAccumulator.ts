const STORAGE = Symbol("STORAGE");
const CACHED_ARRAY = Symbol("CACHED_ARRAY");

export default class StateAccumulator<T> {
  private [STORAGE]: Set<T> = new Set();
  private [CACHED_ARRAY]: Array<T> = [];

  add(newValue: T) {
    this[STORAGE].add(newValue);
    this[CACHED_ARRAY] = Array.from(this[STORAGE]);
  }

  all(): Array<T> {
    return this[CACHED_ARRAY];
  }

  remove(value: T) {
    this[STORAGE].delete(value);
    this[CACHED_ARRAY] = Array.from(this[STORAGE]);
  }
}
