import { error } from '@sveltejs/kit';
import { ALL_PATHS, categoryBySlug, getDoa } from '#lib/server/doa.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

// Setiap doa punya halaman statis sendiri: bisa dibagikan lewat link dan dibuka offline.
export const entries: EntryGenerator = () => ALL_PATHS;

export const load: PageServerLoad = ({ params }) => {
	const doa = getDoa(params.kategori, params.slug);
	if (!doa) error(404, 'Doa tidak ditemukan');
	return { doa, category: categoryBySlug(doa.category)! };
};
