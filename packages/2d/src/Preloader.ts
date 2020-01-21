type Task = () => Promise<any>;

const disposeReturnValue = () => {};

/**
 * A class that helps ensure used resources are loaded before they are used.
 *
 * When resources that must be fetched over the network are created (such as Images and Audio),
 * they register themselves with thie Preloader. To wait until all registered resources have been
 * loaded, use `Preloader.load().then(() => {})`.
 */
class Preloader {
  _currentPromise: Promise<void> = Promise.resolve();

  /** Adds a new task to the Preloader. It will start running immediately. */
  addTask(task: Task) {
    if (this._currentPromise) {
      this._currentPromise = Promise.all([this._currentPromise, task()]).then(
        disposeReturnValue
      );
      return this._currentPromise;
    }

    this._currentPromise = task().then(disposeReturnValue);
    return this._currentPromise;
  }

  /** Returns a Promise which does not resolve until all tasks that have been added to the Preloader have resolved. */
  load(): Promise<void> {
    return this._currentPromise;
  }
}

const singleton = new Preloader();

export default singleton;
