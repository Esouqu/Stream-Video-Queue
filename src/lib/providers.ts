import colors from "tailwindcss/colors";
import DonatePayIcon from "./components/icons/DonatePayIcon.svelte";
import DonationAlertsIcon from "./components/icons/DonationAlertsIcon.svelte";
import KickIcon from "./components/icons/KickIcon.svelte";
import TwitchIcon2 from "./components/icons/TwitchIcon2.svelte";
import type { IntegrationData } from "./types";
import TwitchChatDriver from "./stores/integrations/drivers/TwitchChatDriver";
import KickChatDriver from "./stores/integrations/drivers/KickChatDriver";
import DonationAlertsDriver from "./stores/integrations/drivers/DonationAlertsDriver";
import DonatePayDriver from "./stores/integrations/drivers/DonatePayDriver";

export const AVAILABLE_PROVIDERS: IntegrationData[] = [
	{
		id: "twitch",
		name: "Twitch",
		color: colors.violet[500],
		icon: TwitchIcon2,
		driver: new TwitchChatDriver(),
		isManual: false,
	},
	{
		id: "kick",
		name: "Kick",
		color: colors.lime[500],
		icon: KickIcon,
		driver: new KickChatDriver(),
		isManual: false
	},
	{
		id: "donationalerts",
		name: "DonationAlerts",
		color: colors.amber[500],
		icon: DonationAlertsIcon,
		driver: new DonationAlertsDriver(),
		isManual: false
	},
	{
		id: "donatepay",
		name: "DonatePay",
		color: colors.green[500],
		icon: DonatePayIcon,
		driver: new DonatePayDriver(),
		isManual: true
	},
] as const;

export const AVAILABLE_PROVIDER_IDS = AVAILABLE_PROVIDERS.map((provider) => provider.id);