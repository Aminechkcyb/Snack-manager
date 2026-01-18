export type OrderStatus = "nouveau" | "en_cours" | "termine" | "annule";
export type OrderType = "emporter" | "livraison";

export interface OrderItem {
    name: string;
    quantity: number;
}

export interface Order {
    id: string;
    customerName: string;
    phoneNumber: string;
    items: OrderItem[]; // Structured items for better handling
    totalPrice: number;
    status: OrderStatus;
    type: OrderType;
    timestamp: string; // Time of order (e.g., "19:45")
    date: string; // Date of order (e.g., "17 Jan 2026")
}
