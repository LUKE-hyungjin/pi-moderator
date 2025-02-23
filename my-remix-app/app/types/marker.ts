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

export interface MarkerDetail extends MarkerData {
    created_by: string;
} 