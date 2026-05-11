import EventEmitter from '$lib/utils/EventEmitter';
import { PersistedState } from 'runed';
import { SvelteMap } from 'svelte/reactivity';

type VoteType = 'keep' | 'skip';
type PollEvents = {
	'finished': unknown;
}

class PollStore extends EventEmitter<PollEvents> {
	private _persisted = new PersistedState('pollSettings', {
		isEnabled: false,
		neededVotes: 10,
		keepKeyword: 'Оставить',
		skipKeyword: 'Пропустить',
		canChangeVote: false
	});

	private _counter = $state({ keep: 0, skip: 0 });
	private _votedUsers = new SvelteMap<string, { vote: VoteType }>();

	readonly difference = $derived(this._counter.skip - this._counter.keep);
	readonly isEnoughVotes = $derived(this.difference >= this.neededVotes);

	get votes() { return this._counter.keep + this._counter.skip; }
	get keepVotes() { return this._counter.keep; }
	get skipVotes() { return this._counter.skip; }
	get isEnabled() { return this._persisted.current.isEnabled; }
	set isEnabled(val: boolean) { this._persisted.current.isEnabled = val; }
	get neededVotes() { return this._persisted.current.neededVotes; }
	set neededVotes(val: number) { this._persisted.current.neededVotes = val; }
	get keepKeyword() { return this._persisted.current.keepKeyword; }
	set keepKeyword(val: string) { this._persisted.current.keepKeyword = val; }
	get skipKeyword() { return this._persisted.current.skipKeyword; }
	set skipKeyword(val: string) { this._persisted.current.skipKeyword = val; }
	get canChangeVote() { return this._persisted.current.canChangeVote; }
	set canChangeVote(val: boolean) { this._persisted.current.canChangeVote = val; }

	public addVote(username: string, message: string) {
		if (this.isEnoughVotes) return;

		const vote = this._extractVote(message);
		if (!vote) return;

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

		if (this.isEnoughVotes) this.emit('finished');
	}

	public reset() {
		this._counter.keep = 0;
		this._counter.skip = 0;
		this._votedUsers.clear();
	}

	private _extractVote(str: string) {
		const firstWord = str.trim().split(" ")[0].toLowerCase();
		const keepKeyword = this.keepKeyword.toLowerCase();
		const skipKeyword = this.skipKeyword.toLowerCase();

		if (firstWord === keepKeyword) return 'keep';
		if (firstWord === skipKeyword) return 'skip';
	}
}

export default PollStore;
