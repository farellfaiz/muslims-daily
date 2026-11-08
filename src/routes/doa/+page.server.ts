import { CATEGORIES, TOTAL } from '#lib/server/doa.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ categories: CATEGORIES, total: TOTAL });
