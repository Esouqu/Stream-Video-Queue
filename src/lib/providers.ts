import colors from "tailwindcss/colors";
import DonatePayIcon from "./components/icons/DonatePayIcon.svelte";
import DonationAlertsIcon from "./components/icons/DonationAlertsIcon.svelte";
import KickIcon from "./components/icons/KickIcon.svelte";
import TwitchIcon2 from "./components/icons/TwitchIcon2.svelte";
import type { IntegrationData } from "./types";

export const AVAILABLE_PROVIDERS: IntegrationData[] = [
	{
		id: "twitch",
		name: "Twitch",
		color: colors.violet[500],
		icon: TwitchIcon2,
		isManual: false
	},
	{
		id: "kick",
		name: "Kick",
		color: colors.lime[500],
		icon: KickIcon,
		isManual: false
	},
	{
		id: "donationalerts",
		name: "DonationAlerts",
		color: colors.amber[500],
		icon: DonationAlertsIcon,
		isManual: false
	},
	{
		id: "donatepay",
		name: "DonatePay",
		color: colors.green[500],
		icon: DonatePayIcon,
		isManual: true
	},
] as const;