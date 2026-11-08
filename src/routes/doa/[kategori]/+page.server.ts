import { error } from '@sveltejs/kit';
import { CATEGORIES, categoryBySlug, itemsIn } from '#lib/server/doa.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => CATEGORIES.map((c) => ({ kategori: c.slug }));

export const load: PageServerLoad = ({ params }) => {
	const category = categoryBySlug(params.kategori);
	if (!category) error(404, 'Kategori tidak ditemukan');
	return { category, categories: CATEGORIES, items: itemsIn(category.slug) };
};
