import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { verifyPayment, approvePayment, verifyUser } from '~/api/pi.server';

export const action: ActionFunction = async ({ request }) => {
    if (request.method !== 'POST') {
        return json({ error: 'Method not allowed' }, { status: 405 });
    }

    const data = await request.json();
    const { type, paymentId, txid, accessToken } = data;

    try {
        switch (type) {
            case 'verify_payment':
                return json(await verifyPayment(paymentId, txid));

            case 'approve_payment':
                return json(await approvePayment(paymentId));

            case 'verify_user':
                return json(await verifyUser(accessToken));

            default:
                return json({ error: 'Invalid type' }, { status: 400 });
        }
    } catch (error) {
        console.error('API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return json({ error: errorMessage }, { status: 500 });
    }
};