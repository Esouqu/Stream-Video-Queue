import type { SkipAction } from "$lib/types";
import { PersistedState } from "runed";

class SettingsStore {
	private _state = new PersistedState('settings', {
		player_shouldLoop: false,
		paidTimer_isEnabled: false,
		paidTimer_pricePerMinute: 100,
		prioritizedVideo_price: 100,
		autoSkip_action: 'warning' as SkipAction,

		poll_isEnabled: false,
		poll_neededVotes: 10,
		poll_keepKeyword: 'Оставить',
		poll_skipKeyword: 'Пропустить',
		poll_secondsBeforeStart: 10 as (number | null),
		poll_canChangeVote: false,

		queue_shouldInsertRandomly: false,
		queue_limit: null as (number | null),
	});

	get autoSkipAction() { return this._state.current.autoSkip_action; }
	set autoSkipAction(val: SkipAction) { this._state.current.autoSkip_action = val; }

	get shouldLoop() { return this._state.current.player_shouldLoop; }
	set shouldLoop(val: boolean) { this._state.current.player_shouldLoop = val; }

	get isPaidTimerEnabled() { return this._state.current.paidTimer_isEnabled; }
	set isPaidTimerEnabled(val: boolean) { this._state.current.paidTimer_isEnabled = val; }

	get paidTimerPricePerMinute() { return this._state.current.paidTimer_pricePerMinute; }
	set paidTimerPricePerMinute(val: number) { this._state.current.paidTimer_pricePerMinute = val; }

	get prioritizedVideoPrice() { return this._state.current.prioritizedVideo_price }
	set prioritizedVideoPrice(val: number) { this._state.current.prioritizedVideo_price = val; }

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
