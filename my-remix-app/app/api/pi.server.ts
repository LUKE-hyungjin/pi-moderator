import axios from 'axios';

const PI_API_URL = process.env.PI_API_URL || 'https://api.minepi.com';
const PI_API_KEY = process.env.PI_API_KEY;

export async function verifyPayment(paymentId: string, txid: string) {
    try {
        const response = await axios.post(`${PI_API_URL}/v2/payments/${paymentId}/complete`, {
            txid
        }, {
            headers: {
                'Authorization': `Key ${PI_API_KEY}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Payment verification error:', error);
        throw error;
    }
}

export async function approvePayment(paymentId: string) {
    try {
        const response = await axios.post(`${PI_API_URL}/v2/payments/${paymentId}/approve`, {}, {
            headers: {
                'Authorization': `Key ${PI_API_KEY}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Payment approval error:', error);
        throw error;
    }
}

export async function verifyUser(accessToken: string) {
    try {
        const response = await axios.get(`${PI_API_URL}/v2/me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('User verification error:', error);
        throw error;
    }
}