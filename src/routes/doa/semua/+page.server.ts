import { CATEGORIES, ITEMS } from '#lib/server/doa.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ items: ITEMS, categories: CATEGORIES });
