import type { IntegrationId } from "$lib/types";
import { SvelteMap } from "svelte/reactivity";
import Integration from "./Integration.svelte";

class IntegrationManager {
	private _integrations = new SvelteMap<IntegrationId, Integration>();

	get integrations() { return Array.from(this._integrations.values()) }

	public connectAll() {
		for (const conn of this._integrations.values()) {
			conn.connect();
		}
	}

	public disconnectAll() {
		for (const conn of this._integrations.values()) {
			conn.disconnect();
		}
	}

	public toggle(id: IntegrationId) {
		const integration = this._integrations.get(id);

		if (integration?.isOpen) {
			integration?.disconnect();
		} else {
			integration?.connect();
		}
	}

	public remove(integrationId: IntegrationId) {
		const integration = this._integrations.get(integrationId);
		integration?.disconnect();
		this._integrations.delete(integrationId);
	}

	public add(integration: Integration) {
		this._integrations.set(integration.data.id, integration);
	}
}

export default IntegrationManager;
