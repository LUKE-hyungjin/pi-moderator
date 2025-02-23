export type MarkerType = 'education' | 'relay' | 'tax';

export interface MarkerData {
    id: string;
    position: [number, number];
    name: string;
    address: string;
    phone: string;
    feePercentage: number;
    description: string;
    created_at: string;
    image_url: string;
    type: MarkerType;
}

export type Scope = 'username' | 'payments';

export interface AuthResult {
    accessToken: string;
    user: {
        uid: string;
        username: string;
    };
}

export interface PaymentDTO {
    amount: number;
    user_uid: string;
    created_at: string;
    identifier: string;
    metadata: Object;
    memo: string;
    status: {
        developer_approved: boolean;
        transaction_verified: boolean;
        developer_completed: boolean;
        cancelled: boolean;
        user_cancelled: boolean;
    };
    to_address: string;
    transaction: null | {
        txid: string;
        verified: boolean;
        _link: string;
    };
}

export interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

export interface FooterProps {
    totalUsers: number;
    todayUsers: number;
} 