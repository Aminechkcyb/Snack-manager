"use client";

import { useState, useEffect } from "react";
import { Order, OrderStatus } from "@/lib/types";

const LOYAL_CLIENT_ORDERS = Array.from({ length: 25 }).map((_, i) => ({
    id: `loyal-${i}`,
    customerName: "Sophie Martin",
    phoneNumber: "06 00 00 00 00",
    items: [{ name: "Menu complet", quantity: 1 }],
    totalPrice: 15.00,
    status: "termine" as OrderStatus,
    type: "emporter" as const,
    timestamp: "12:00",
    date: "15 Jan 2026"
}));

const INITIAL_ORDERS: Order[] = [
    ...LOYAL_CLIENT_ORDERS,
    // Active Orders (Dashboard)
    {
        id: "105",
        customerName: "Thomas Martin",
        phoneNumber: "06 11 22 33 44",
        items: [{ name: "Menu Burger Double", quantity: 2 }, { name: "Nuggets x6", quantity: 1 }],
        totalPrice: 28.50,
        status: "nouveau",
        type: "livraison",
        timestamp: "19:55",
        date: "18 Jan 2026"
    },
    // ... existing orders (I will keep them by targeting carefully or just replacing the start)
    // Actually I need to be careful not to delete the rest if I use replace.
    // I will replace INITIAL_ORDERS declaration entirely if I can view it all, but better to just PREPEND and use Start/End on the definition.
    // The previous view_file showed lines 6-109.

    // Let's just replace the whole array definition start to include LOYAL_CLIENT_ORDERS
    // And bump the key.

    {
        id: "104",
        customerName: "Sarah Connor",
        phoneNumber: "06 99 88 77 66",
        items: [{ name: "Tacos 3 Viandes", quantity: 1 }, { name: "Tiramisu", quantity: 1 }],
        totalPrice: 15.00,
        status: "en_cours",
        type: "emporter",
        timestamp: "19:48",
        date: "18 Jan 2026"
    },
    {
        id: "103",
        customerName: "Lucas Dubreuil",
        phoneNumber: "07 55 44 33 22",
        items: [{ name: "Pizza 4 Fromages", quantity: 1 }, { name: "Coca-Cola 1.5L", quantity: 1 }],
        totalPrice: 16.50,
        status: "nouveau",
        type: "emporter",
        timestamp: "19:42",
        date: "18 Jan 2026"
    },

    // History Orders
    {
        id: "102",
        customerName: "Marie Lemoine",
        phoneNumber: "07 88 99 00 11",
        items: [{ name: "Tacos XL", quantity: 1 }, { name: "Coca-Cola", quantity: 1 }],
        totalPrice: 12.00,
        status: "termine",
        type: "livraison",
        timestamp: "19:30",
        date: "18 Jan 2026"
    },
    {
        id: "101",
        customerName: "Jean Dupont",
        phoneNumber: "06 12 34 56 78",
        items: [{ name: "Burger Classic", quantity: 2 }, { name: "Frites", quantity: 1 }],
        totalPrice: 24.50,
        status: "termine",
        type: "emporter",
        timestamp: "19:15",
        date: "18 Jan 2026"
    },
    {
        id: "99",
        customerName: "Sophie Morel",
        phoneNumber: "06 55 11 22 33",
        items: [{ name: "Salade César", quantity: 1 }, { name: "Eau Minérale", quantity: 1 }],
        totalPrice: 10.50,
        status: "termine",
        type: "emporter",
        timestamp: "12:45",
        date: "17 Jan 2026"
    },
    {
        id: "98",
        customerName: "Jean Dupont", // Loyal customer example
        phoneNumber: "06 12 34 56 78",
        items: [{ name: "Pizza Regina", quantity: 1 }],
        totalPrice: 14.00,
        status: "termine",
        type: "livraison",
        timestamp: "20:30",
        date: "16 Jan 2026"
    },
    {
        id: "97",
        customerName: "Pierre Durand",
        phoneNumber: "07 44 55 66 77",
        items: [{ name: "Burger Enfant", quantity: 1 }, { name: "Capri-Sun", quantity: 1 }],
        totalPrice: 8.00,
        status: "annule",
        type: "emporter",
        timestamp: "19:00",
        date: "16 Jan 2026"
    },
    {
        id: "96",
        customerName: "Jean Dupont", // Loyal customer example
        phoneNumber: "06 12 34 56 78",
        items: [{ name: "Tacos L", quantity: 2 }],
        totalPrice: 20.00,
        status: "termine",
        type: "emporter",
        timestamp: "18:15",
        date: "10 Jan 2026"
    }
];

export function useOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("snackOrders_v3");
        if (saved) {
            setOrders(JSON.parse(saved));
        } else {
            setOrders(INITIAL_ORDERS);
            localStorage.setItem("snackOrders_v3", JSON.stringify(INITIAL_ORDERS));
        }
        setIsLoaded(true);
    }, []);

    // Sound Notification Logic (Robust Singleton Pattern + Speech)
    const playNotificationSound = async () => {
        // Strategy 1: Speech Synthesis (Backup for accessibility/mobile)
        try {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance("Ding ! Nouvelle commande !");
                utterance.rate = 1.1;
                utterance.lang = 'fr-FR';
                window.speechSynthesis.speak(utterance);
            }
        } catch (e) {
            console.error("Speech error", e);
        }

        // Strategy 2: AudioContext (Primary Beep)
        try {
            // Use global context if available, otherwise create one
            if (!(window as any).notificationAudioContext) {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContext) {
                    (window as any).notificationAudioContext = new AudioContext();
                }
            }

            const ctx = (window as any).notificationAudioContext;
            if (!ctx) {
                console.error("❌ AudioContext not supported on this device.");
                return;
            }

            // Always try to resume (fixes 'suspended' state on Chrome/Safari)
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }

            // OSCILLATOR 1 (Main Tone - Ding)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.connect(gain1);
            gain1.connect(ctx.destination);

            osc1.type = 'square'; // Aggressive/Loud wave type (Gameboy style) to be sure it's heard
            osc1.frequency.setValueAtTime(660, ctx.currentTime);
            gain1.gain.setValueAtTime(0.2, ctx.currentTime); // Moderate gain for Square wave (it's naturally loud)
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.6);

            // OSCILLATOR 2 (Harmonic - Dong)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);

            osc2.type = 'square';
            osc2.frequency.setValueAtTime(520, ctx.currentTime + 0.15);
            gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.15);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

            osc2.start(ctx.currentTime + 0.15);
            osc2.stop(ctx.currentTime + 1.2);

            console.log("🔊 Playing Loud Notification (Square Wave)");
        } catch (e) {
            console.error("❌ Audio Error:", e);
        }
    };

    // Better Approach: Trigger sound in addOrder directly. Much simpler and safer.

    const saveOrders = (newOrders: Order[]) => {
        setOrders(newOrders);
        localStorage.setItem("snackOrders_v2", JSON.stringify(newOrders));
    };

    const updateOrderStatus = (id: string, newStatus: OrderStatus) => {
        const newOrders = orders.map(o =>
            o.id === id ? { ...o, status: newStatus } : o
        );
        saveOrders(newOrders);
    };

    // Active orders are those NOT finished or cancelled
    // OR we can decide "annule" stays in active for a bit? 
    // Usually "termine" and "annule" go to history.
    const activeOrders = orders.filter(o => o.status !== "termine" && o.status !== "annule");

    // History orders are "termine" or "annule"
    const historyOrders = orders.filter(o => o.status === "termine" || o.status === "annule");

    const getClientHistory = (phoneNumber: string) => {
        return orders.filter(o => o.phoneNumber === phoneNumber).sort((a, b) => {
            // Sort by date/time descending roughly
            return new Date(`${b.date} ${b.timestamp || '00:00'}`).getTime() - new Date(`${a.date} ${a.timestamp || '00:00'}`).getTime();
        });
    };

    const addOrder = (order: Order) => {
        const newOrders = [order, ...orders];
        saveOrders(newOrders);
        playNotificationSound();
    };

    return {
        orders,
        activeOrders,
        historyOrders,
        updateOrderStatus,
        getClientHistory,
        addOrder,
        isLoaded,
        playNotificationSound
    };
}
