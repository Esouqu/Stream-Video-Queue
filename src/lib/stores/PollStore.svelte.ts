import EventEmitter from '$lib/utils/EventEmitter';
import { SvelteMap } from 'svelte/reactivity';
import TimerStore from './TimerStore.svelte';
import type SettingsStore from './SettingsStore.svelte';

type VoteType = 'keep' | 'skip';
type PollEvents = {
	'finished': unknown;
}

class PollStore extends EventEmitter<PollEvents> {
	private _settings: SettingsStore;

	private _counter = $state({ keep: 0, skip: 0 });
	private _votedUsers = new SvelteMap<string, { vote: VoteType }>();

	readonly blockTimer = new TimerStore();
	readonly difference = $derived(this._counter.skip - this._counter.keep);
	readonly isEnoughVotes: boolean;

	get votes() { return this._counter.keep + this._counter.skip; }
	get keepVotes() { return this._counter.keep; }
	get skipVotes() { return this._counter.skip; }

	constructor(settings: SettingsStore) {
		super();

		this._settings = settings;
		this.isEnoughVotes = $derived(this.difference >= this._settings.neededVotes)
	}

	public addVote(username: string, message: string) {
		if (this.isEnoughVotes) return;

		if (this.blockTimer.isRunning) return;

		const vote = this._extractVote(message);
		if (!vote) return;

		const user = this._votedUsers.get(username);

		if (user && this._settings.canChangeVote) {
			if (user.vote !== vote) {
				this._counter[user.vote]--;
				this._counter[vote]++;
				this._votedUsers.set(username, { vote });
			}
		} else if (!user) {
			this._counter[vote]++;
			this._votedUsers.set(username, { vote });
		}

		if (this.isEnoughVotes) this.emit('finished');
	}

	public reset(isManual = false) {
		this._counter.keep = 0;
		this._counter.skip = 0;
		this._votedUsers.clear();

		if (isManual) return;

		if (this._settings.secondsBeforeStart) {
			this.blockTimer.reset();
			this.blockTimer.start(this._settings.secondsBeforeStart * 1000);
		}
	}

	private _extractVote(str: string) {
		const firstWord = str.trim().split(" ")[0].toLowerCase();
		const keepKeyword = this._settings.keepKeyword.toLowerCase();
		const skipKeyword = this._settings.skipKeyword.toLowerCase();

		if (firstWord === keepKeyword) return 'keep';
		if (firstWord === skipKeyword) return 'skip';
	}
}

export default PollStore;
