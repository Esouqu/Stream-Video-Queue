import Color from "color";
import { PersistedState } from "runed";

class RandomColorStore {
	private _colors = [
		Color('#fb2c36'),
		Color('#00c951'),
		Color('#2b7fff'),
		Color('#615fff'),
		Color('#ad46ff'),
		Color('#f6339a'),
	];
	private _current = new PersistedState('currentColorIndex', 0);

	public get() {
		const color = this._colors[this._current.current];
		if (!color) throw new Error('');

		this._current.current = (this._current.current + 1) % this._colors.length;

		return color;
	}
}

export default RandomColorStore;
