import Color from "color";
import QueueStore from "./QueueStore.svelte";

class RandomColor {
	private _colors = [
		{ id: 'red', color: Color('#fb2c36') }, // red
		{ id: 'green', color: Color('#00c951') }, // green
		{ id: 'blue', color: Color('#2b7fff') }, // blue
		{ id: 'indigo', color: Color('#615fff') }, // indigo
		{ id: 'purple', color: Color('#ad46ff') }, // purple
		{ id: 'pink', color: Color('#f6339a') }, // pink
	];
	private _queue = new QueueStore('randomColors', this._colors);

	public get() {
		const item = this._queue.current;
		if (!item) throw new Error('No current item in queue');

		this._queue.next();

		return item.color;
	}
}

export default RandomColor;
