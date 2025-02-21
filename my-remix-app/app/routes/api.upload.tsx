import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { supabase } from '~/lib/supabase.server';

export const action: ActionFunction = async ({ request }) => {
    if (request.method !== 'POST') {
        return json({ error: 'Method not allowed' }, { status: 405 });
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
        return json({ error: 'No image provided' }, { status: 400 });
    }

    try {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('marker-images')
            .upload(fileName, image, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('marker-images')
            .getPublicUrl(fileName);

        return json({ url: publicUrl });
    } catch (error) {
        console.error('Upload error:', error);
        return json({ error: 'Upload failed' }, { status: 500 });
    }
};