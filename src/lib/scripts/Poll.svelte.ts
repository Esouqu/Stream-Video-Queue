import { storable } from "./LocalStore.svelte";

class Poll {
  private _settings = storable({
    isEnabled: false,
    neededVotes: 10,
    keepKeyword: 'Оставить',
    skipKeyword: 'Пропустить',
    shouldAutoSkip: false,
  }, 'pollSettings');

  private _counter = $state({ keep: 0, skip: 0 });
  public difference = $derived(this._counter.skip - this._counter.keep);
  public currentPercent = $derived.by(this.calculateProgressBarPercentage.bind(this));
  public isEnoughVotes = $derived(this.difference >= this._settings.value.neededVotes);

  private _votedUsers = new Set();

  public addKeep(username: string) {
    const isUserVoted = this._votedUsers.has(username);

    if (!isUserVoted) {
      this._counter.keep++;
      this._votedUsers.add(username);
    }
  }

  public addSkip(username: string) {
    const isUserVoted = this._votedUsers.has(username);

    if (!isUserVoted) {
      this._counter.skip++;
      this._votedUsers.add(username);
    }
  }

  public resetCounter() {
    this._counter = { keep: 0, skip: 0 };
    this._votedUsers.clear();
  }

  private calculateProgressBarPercentage() {
    const normalizedVoteDifference = (this.difference / this._settings.value.neededVotes) * -50;
    const currentPercent = normalizedVoteDifference + 50;

    return currentPercent;
  }

  get keep() { return this._counter.keep; }
  get skip() { return this._counter.skip; }
  get isEnabled() { return this._settings.value.isEnabled; }
  set isEnabled(val: boolean) { this._settings.value.isEnabled = val; }
  get neededVotes() { return this._settings.value.neededVotes; }
  set neededVotes(val: number) { this._settings.value.neededVotes = val; }
  get keepKeyword() { return this._settings.value.keepKeyword; }
  set keepKeyword(val: string) { this._settings.value.keepKeyword = val; }
  get skipKeyword() { return this._settings.value.skipKeyword; }
  set skipKeyword(val: string) { this._settings.value.skipKeyword = val; }
  get shouldAutoSkip() { return this._settings.value.shouldAutoSkip; }
  set shouldAutoSkip(val: boolean) { this._settings.value.shouldAutoSkip = val; }
}

export default Poll;