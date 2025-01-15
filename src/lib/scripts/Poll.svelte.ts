import { storable } from "./LocalStore.svelte";

class Poll {
  private _settings = storable({
    isEnabled: false,
    neededVotes: 10,
    keepKeyword: 'Оставить',
    skipKeyword: 'Пропустить',
    shouldAutoSkip: false,
    canChangeVote: false
  }, 'pollSettings');

  private _counter = $state({ keep: 0, skip: 0 });
  public difference = $derived(this._counter.skip - this._counter.keep);
  public currentPercent = $derived.by(this.calculateProgressBarPercentage.bind(this));
  public isEnoughVotes = $derived(this.difference >= this._settings.value.neededVotes);

  private _votedUsers = new Map<string, { vote: 'keep' | 'skip' }>();

  private _vote(username: string, vote: 'keep' | 'skip') {
    const user = this._votedUsers.get(username);

    if (user && this.canChangeVote) {
      if (user.vote !== vote) {
        this._counter[user.vote]--;
        this._counter[vote]++;
        this._votedUsers.set(username, { vote });
      }
    } else if (!user) {
      this._counter[vote]++;
      this._votedUsers.set(username, { vote });
    }
  }

  public addKeep(username: string) {
    this._vote(username, 'keep');
  }

  public addSkip(username: string) {
    this._vote(username, 'skip');
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
  get canChangeVote() { return this._settings.value.canChangeVote; }
  set canChangeVote(val: boolean) { this._settings.value.canChangeVote = val; }
}

export default Poll;