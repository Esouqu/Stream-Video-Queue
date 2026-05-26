import colors from "tailwindcss/colors";
import DonatePayIcon from "./components/icons/DonatePayIcon.svelte";
import DonationAlertsIcon from "./components/icons/DonationAlertsIcon.svelte";
import KickIcon from "./components/icons/KickIcon.svelte";
import TwitchIcon2 from "./components/icons/TwitchIcon2.svelte";
import type { IntegrationConfig } from "./types";
import TwitchChatDriver from "./socket-drivers/TwitchChatDriver";
import KickChatDriver from "./socket-drivers/KickChatDriver";
import DonationAlertsDriver from "./socket-drivers/DonationAlertsDriver";
import DonatePayDriver from "./socket-drivers/DonatePayDriver";

export const AVAILABLE_PROVIDERS: IntegrationConfig[] = [
	{
		data: {
			id: "twitch",
			name: "Twitch",
			color: colors.violet[500],
			icon: TwitchIcon2,
		},
		driver: new TwitchChatDriver(),
	},
	{
		data: {
			id: "kick",
			name: "Kick",
			color: colors.lime[500],
			icon: KickIcon,
		},
		driver: new KickChatDriver(),
	},
	{
		data: {
			id: "donationalerts",
			name: "DonationAlerts",
			color: colors.amber[500],
			icon: DonationAlertsIcon,
		},
		driver: new DonationAlertsDriver(),
	},
	{
		data: {
			id: "donatepay",
			name: "DonatePay",
			color: colors.green[500],
			icon: DonatePayIcon,
			shouldHandleApiKey: true
		},
		driver: new DonatePayDriver(),
	},
] as const;

export const AVAILABLE_PROVIDER_IDS = AVAILABLE_PROVIDERS.map((provider) => provider.data.id);