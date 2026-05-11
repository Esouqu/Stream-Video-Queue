class UserStore<T> {
	private _user: T | null = $state(null);

	public clearUser() {
		this._user = null;
	}

	public setUser(user: T) {
		this._user = user;
	}
}

export default UserStore;
