import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { verifyPayment, approvePayment, verifyUser } from '~/api/pi.server';
import { handleUserAuthentication, updateUserData, verifyPiUser } from "~/services/pi-auth.server";

export const action: ActionFunction = async ({ request }) => {
    if (request.method !== 'POST') {
        return json({ error: 'Method not allowed' }, { status: 405 });
    }

    const data = await request.json();

    try {
        switch (data.type) {
            case 'verify_payment':
                return json(await verifyPayment(data.paymentId, data.txid));

            case 'approve_payment':
                return json(await approvePayment(data.paymentId));

            case 'verify_user': {
                const { userData, canReceiveReward, now } = await handleUserAuthentication(data.authResult);
                return json({ userData, canReceiveReward, now });
            }

            case 'update_user': {
                await updateUserData(data.userId, data.username, data.userData, new Date(data.now));
                return json({ success: true });
            }

            default:
                return json({ error: 'Unknown action type' }, { status: 400 });
        }
    } catch (error) {
        console.error('API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return json({ error: errorMessage }, { status: 500 });
    }
};