import { dev } from '$app/environment';
import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
import { inject } from '@vercel/analytics';

inject({ mode: dev ? 'development' : 'production' });
if (!dev) injectSpeedInsights();