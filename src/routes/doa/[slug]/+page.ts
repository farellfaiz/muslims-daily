import { error } from '@sveltejs/kit';
import { DOA, bySlug } from '#lib/data/doa.ts';
import type { EntryGenerator, PageLoad } from './$types';

// Setiap doa punya halaman statis sendiri: bisa dibagikan lewat link dan dibuka offline.
export const entries: EntryGenerator = () => DOA.map((d) => ({ slug: d.slug }));

export const load: PageLoad = ({ params }) => {
	const doa = bySlug(params.slug);
	if (!doa) error(404, 'Doa tidak ditemukan');
	return { doa };
};
