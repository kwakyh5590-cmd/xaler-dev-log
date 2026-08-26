// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://kwakyh5590-cmd.github.io',
	base: '/xaler-dev-log',
	integrations: [mdx(), sitemap()],
});
