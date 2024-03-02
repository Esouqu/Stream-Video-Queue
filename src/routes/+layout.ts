import { dev } from '$app/environment';
import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
import { inject } from '@vercel/analytics';

export const ssr = false;

inject({ mode: dev ? 'development' : 'production' });
if (!dev) injectSpeedInsights();