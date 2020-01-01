type Task = () => Promise<any>;

const disposeReturnValue = () => {};

// TODO: Parallel loading
class Preloader {
  _currentPromise: Promise<void> = Promise.resolve();

  addTask(task: Task) {
    if (this._currentPromise) {
      this._currentPromise = this._currentPromise.then(() => {
        return task().then(disposeReturnValue);
      });
      return this._currentPromise;
    }

    this._currentPromise = task().then(disposeReturnValue);
    return this._currentPromise;
  }

  load(): Promise<void> {
    return this._currentPromise;
  }
}

const singleton = new Preloader();

export default singleton;
