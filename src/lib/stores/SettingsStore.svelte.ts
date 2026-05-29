import type { SkipAction } from "$lib/types";
import { PersistedState } from "runed";

class SettingsStore {
	private _state = new PersistedState('settings', {
		maxRequestsPerUser: 1 as (number | null),

		player_shouldLoop: false,

		paidTime_isEnabled: false,
		paidTime_pricePerMinute: 100,
		paidVideo_price: 100,

		poll_isEnabled: false,
		poll_neededVotes: 10,
		poll_keepKeyword: 'Оставить',
		poll_skipKeyword: 'Пропустить',
		poll_secondsBeforeStart: 10 as (number | null),
		poll_canChangeVote: false,

		autoSkip_action: 'warning' as SkipAction,
		queue_shouldInsertRandomly: false,
		queue_limit: null as (number | null),
	});

	get maxRequestsPerUser() { return this._state.current.maxRequestsPerUser; }
	set maxRequestsPerUser(val: number | null) { this._state.current.maxRequestsPerUser = val; }

	get autoSkipAction() { return this._state.current.autoSkip_action; }
	set autoSkipAction(val: SkipAction) { this._state.current.autoSkip_action = val; }

	get shouldLoop() { return this._state.current.player_shouldLoop; }
	set shouldLoop(val: boolean) { this._state.current.player_shouldLoop = val; }

	get isPaidTimeEnabled() { return this._state.current.paidTime_isEnabled; }
	set isPaidTimeEnabled(val: boolean) { this._state.current.paidTime_isEnabled = val; }

	get paidTimePricePerMinute() { return this._state.current.paidTime_pricePerMinute; }
	set paidTimePricePerMinute(val: number) { this._state.current.paidTime_pricePerMinute = val; }

	get paidVideoPrice() { return this._state.current.paidVideo_price }
	set paidVideoPrice(val: number) { this._state.current.paidVideo_price = val; }

	get isPollEnabled() { return this._state.current.poll_isEnabled; }
	set isPollEnabled(val: boolean) { this._state.current.poll_isEnabled = val; }

	get neededVotes() { return this._state.current.poll_neededVotes; }
	set neededVotes(val: number) { this._state.current.poll_neededVotes = val; }

	get keepKeyword() { return this._state.current.poll_keepKeyword; }
	set keepKeyword(val: string) { this._state.current.poll_keepKeyword = val; }

	get skipKeyword() { return this._state.current.poll_skipKeyword; }
	set skipKeyword(val: string) { this._state.current.poll_skipKeyword = val; }

	get secondsBeforeStart() { return this._state.current.poll_secondsBeforeStart; }
	set secondsBeforeStart(val: number | null) { this._state.current.poll_secondsBeforeStart = val; }

	get canChangeVote() { return this._state.current.poll_canChangeVote; }
	set canChangeVote(val: boolean) { this._state.current.poll_canChangeVote = val; }

	get shouldInsertRandomly() { return this._state.current.queue_shouldInsertRandomly; }
	set shouldInsertRandomly(value: boolean) { this._state.current.queue_shouldInsertRandomly = value; }

	get queueLimit() { return this._state.current.queue_limit; }
	set queueLimit(val: number | null) { this._state.current.queue_limit = val; }
}

export default SettingsStore;
