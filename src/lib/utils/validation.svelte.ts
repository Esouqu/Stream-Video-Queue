type ValidationRule<T = string> = {
	validate: (value: T) => boolean;
	message: string;
};

export class FieldValidator<T = string> {
	private _error = $state('');
	private _rules: ValidationRule<T>[] = [];
	private _onValidCallback?: (value: T) => void;

	get error() { return this._error; }

	public required(message = 'Поле не должно быть пустым'): this {
		this._rules.push({
			validate: (value) => String(value).length > 0,
			message
		});
		return this;
	}

	public minLength(min: number, message?: string): this {
		this._rules.push({
			validate: (value) => String(value).length >= min,
			message: message ?? `Минимальная длина: ${min} символов`
		});
		return this;
	}

	public maxLength(max: number, message?: string): this {
		this._rules.push({
			validate: (value) => String(value).length <= max,
			message: message ?? `Максимальная длина: ${max} символов`
		});
		return this;
	}

	public pattern(regex: RegExp, message = 'Неверный формат'): this {
		this._rules.push({
			validate: (value) => regex.test(String(value)),
			message
		});
		return this;
	}

	public numeric(message = 'Только числа'): this {
		this._rules.push({
			validate: (value) => /^\d+$/.test(String(value)),
			message
		});
		return this;
	}

	public custom(validate: (value: T) => boolean, message: string): this {
		this._rules.push({ validate, message });
		return this;
	}

	public onValid(callback: (value: T) => void): this {
		this._onValidCallback = callback;
		return this;
	}

	public setValue(value: T): boolean {
		for (const rule of this._rules) {
			if (!rule.validate(value)) {
				this._error = rule.message;
				return false;
			}
		}

		this._error = '';
		this._onValidCallback?.(value);
		return true;
	}

	public clearError(): this {
		this._error = '';
		return this;
	}
}

// Factory function for cleaner syntax
export function createValidator<T = string>(): FieldValidator<T> {
	return new FieldValidator<T>();
}