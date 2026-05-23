type TimeInterval = {
	label: Intl.RelativeTimeFormatUnit;
	seconds: number;
}

class NumberFormatter {
	private static _7_HOURS = 7 * 60 * 60 * 1000;
	private static _1_HOUR = 60 * 60 * 1000;
	private static _1_MINUTE = 60 * 1000;
	private static _relativeTimeFormatter = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' });
	private static _viewsFormatter = Intl.NumberFormat('ru', { notation: 'compact' });
	private static _currencyFormatter = Intl.NumberFormat("ru-RU", {
		style: "currency",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
		currency: "RUB",
	});

	public static timeStringToMs(str: string) {
		const parts = str.split(':').map(Number);

		let hours = 0;
		let minutes = 0;
		let seconds = 0;

		if (parts.length === 3) {
			[hours, minutes, seconds] = parts;
		} else if (parts.length === 2) {
			[minutes, seconds] = parts;
		} else if (parts.length === 1) {
			[seconds] = parts;
		}

		return ((hours * 3600) + (minutes * 60) + seconds) * 1000;
	}

	public static formatTimerValue(ms: number, startMs = ms) {
		let formatter = Intl.DateTimeFormat('ru-RU', {
			second: '2-digit'
		});

		if (startMs >= this._1_HOUR) {
			formatter = Intl.DateTimeFormat('ru-RU', {
				hour: 'numeric',
				minute: '2-digit',
				second: '2-digit'
			});
		} else if (startMs >= this._1_MINUTE) {
			formatter = Intl.DateTimeFormat('ru-RU', {
				minute: 'numeric',
				second: '2-digit'
			});
		}

		return formatter.format(ms - this._7_HOURS);
	}

	public static formatCurrency(number: number): string {
		if (number === 0) return "0";

		return this._currencyFormatter.format(number);
	}

	public static formatViews(views: number) {
		return `${this._viewsFormatter.format(views)}`;
	}

	public static timeAgo(date: string) {
		const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

		const intervals: TimeInterval[] = [
			{ label: 'year', seconds: 31536000 },
			{ label: 'month', seconds: 2592000 },
			{ label: 'week', seconds: 604800 },
			{ label: 'day', seconds: 86400 },
			{ label: 'hour', seconds: 3600 },
			{ label: 'minute', seconds: 60 },
			{ label: 'second', seconds: 1 },
		];

		for (const interval of intervals) {
			const count = Math.floor(seconds / interval.seconds);
			if (count >= 1) {
				return this._relativeTimeFormatter.format(-count, interval.label);
			}
		}

		return this._relativeTimeFormatter.format(0, 'second'); // "now"
	}
}

export default NumberFormatter;
