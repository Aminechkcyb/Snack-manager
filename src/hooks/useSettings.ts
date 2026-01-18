import { useState, useEffect } from "react";

export interface AppSettings {
    restaurantName: string;
    primaryColor: string;
    customColor?: string; // Hex code for custom theme
    logo: string | null;
    logoSize: number;
    loyaltyTarget: number; // Orders needed for 1 star
}

const INITIAL_SETTINGS: AppSettings = {
    restaurantName: "Snack Manager",
    primaryColor: "blue",
    customColor: "#2563eb",
    logo: null,
    logoSize: 40,
    loyaltyTarget: 10
};

export const COLOR_THEMES = {
    blue: {
        name: "Océan (Défaut)",
        gradient: "from-blue-600 to-cyan-500",
        solidBg: "bg-blue-600",
        solidText: "text-blue-600",
        lightBg: "bg-blue-50",
        borderColor: "border-blue-100",
        ringColor: "ring-blue-500",
        hex: "#2563eb"
    },
    purple: {
        name: "Néon Purple",
        gradient: "from-purple-600 to-pink-500",
        solidBg: "bg-purple-600",
        solidText: "text-purple-600",
        lightBg: "bg-purple-50",
        borderColor: "border-purple-100",
        ringColor: "ring-purple-500",
        hex: "#9333ea"
    },
    orange: {
        name: "Sunset Orange",
        gradient: "from-orange-500 to-red-500",
        solidBg: "bg-orange-500",
        solidText: "text-orange-500",
        lightBg: "bg-orange-50",
        borderColor: "border-orange-100",
        ringColor: "ring-orange-500",
        hex: "#f97316"
    },
    green: {
        name: "Fresh Green",
        gradient: "from-emerald-500 to-teal-500",
        solidBg: "bg-emerald-500",
        solidText: "text-emerald-500",
        lightBg: "bg-emerald-50",
        borderColor: "border-emerald-100",
        ringColor: "ring-emerald-500",
        hex: "#10b981"
    },
    black: {
        name: "Luxe Black",
        gradient: "from-slate-900 to-slate-700",
        solidBg: "bg-slate-900",
        solidText: "text-slate-900",
        lightBg: "bg-slate-100",
        borderColor: "border-slate-200",
        ringColor: "ring-slate-900",
        hex: "#0f172a"
    },
    custom: {
        name: "Personnalisé",
        // These use generic variables that we will inject via style
        gradient: "from-[var(--theme-color)] to-[var(--theme-color-soft)]", // fallback or use arbitrary
        solidBg: "bg-[var(--theme-color)]",
        solidText: "text-[var(--theme-color)]",
        lightBg: "bg-[var(--theme-color-light)]",
        borderColor: "border-[var(--theme-color-light)]",
        ringColor: "ring-[var(--theme-color)]",
        hex: "var(--theme-color)"
    }
};

export type ThemeKey = keyof typeof COLOR_THEMES;

export function useSettings() {
    const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("snackSettings");
        if (saved) {
            try {
                setSettings({ ...INITIAL_SETTINGS, ...JSON.parse(saved) });
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("snackSettings", JSON.stringify(settings));
        }
    }, [settings, isLoaded]);

    const updateSettings = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const currentTheme = settings.primaryColor === 'custom'
        ? { ...COLOR_THEMES.custom, hex: settings.customColor || "#000000" }
        : (COLOR_THEMES[settings.primaryColor as ThemeKey] || COLOR_THEMES.blue);

    return {
        settings,
        updateSettings,
        isLoaded,
        currentTheme
    };
}
