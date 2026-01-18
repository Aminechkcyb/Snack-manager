"use client";

import { useState, useEffect, useRef } from "react";
import {
    Building2,
    Upload,
    Palette,
    Star,
    CreditCard,
    BarChart3,
    Check,
    ChevronRight,
    Monitor,
    Users,
    Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSettings } from "@/contexts/SettingsContext";
import { COLOR_THEMES, ThemeKey } from "@/hooks/useSettings";

export default function SettingsPage() {
    const { settings, updateSettings, isLoaded, currentTheme } = useAppSettings();
    const [role, setRole] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setRole(localStorage.getItem("userRole"));
    }, []);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateSettings({ logo: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isLoaded) return <div className="p-8">Chargement...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-slate-900">Paramètres</h1>
                <p className="text-slate-500">Configurez votre application et vos préférences</p>
            </div>

            {/* Profil du Restaurant */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Building2 className={cn("h-5 w-5", currentTheme.solidText)} />
                    Profil du Restaurant
                </h2>
                <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Nom de l'établissement</label>
                            <input
                                type="text"
                                value={settings.restaurantName}
                                onChange={(e) => updateSettings({ restaurantName: e.target.value })}
                                className={cn(
                                    "w-full px-4 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all",
                                    currentTheme.ringColor ? `focus:ring-${currentTheme.ringColor}/20` : "focus:ring-blue-500/20"
                                )}
                                style={settings.primaryColor === 'custom' ? { outlineColor: settings.customColor } : {}}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Logo du restaurant</label>
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border transition-all duration-300",
                                        settings.logo ? "p-0" : "p-2"
                                    )} style={{ height: settings.logoSize || 40, width: settings.logoSize || 40 }}>
                                        {settings.logo ? (
                                            <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-xs font-bold text-slate-400">Log</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Changer le logo
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                        />
                                        {settings.logo && (
                                            <button
                                                onClick={() => updateSettings({ logo: null })}
                                                className="text-xs text-red-500 hover:underline text-left"
                                            >
                                                Supprimer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex justify-between">
                                    Taille du logo
                                    <span className="text-slate-500 font-normal">{settings.logoSize || 40}px</span>
                                </label>
                                <input
                                    type="range"
                                    min="20"
                                    max="120"
                                    step="4"
                                    value={settings.logoSize || 40}
                                    onChange={(e) => updateSettings({ logoSize: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Personnalisation */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Palette className={cn("h-5 w-5", currentTheme.solidText)} />
                    Personnalisation visuelle
                </h2>
                <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-700">Thème de l'interface</label>
                        <div className="flex flex-wrap gap-4">
                            {(Object.keys(COLOR_THEMES) as ThemeKey[]).map((key) => {
                                if (key === 'custom') return null; // Handle custom separately
                                const theme = COLOR_THEMES[key];
                                const isActive = settings.primaryColor === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => updateSettings({ primaryColor: key })}
                                        className={cn(
                                            "flex flex-col items-center gap-2 group transition-all",
                                            isActive ? "opacity-100 scale-105" : "opacity-70 hover:opacity-100 hover:scale-105"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "h-12 w-12 rounded-full transition-all flex items-center justify-center shadow-lg",
                                                isActive ? "ring-2 ring-offset-2 ring-slate-900" : ""
                                            )}
                                            style={{ background: theme.hex }}
                                        >
                                            {isActive && <Check className="h-5 w-5 text-white" />}
                                        </div>
                                        <span className={cn(
                                            "text-xs font-medium",
                                            isActive ? "text-slate-900" : "text-slate-500"
                                        )}>
                                            {theme.name}
                                        </span>
                                    </button>
                                );
                            })}

                            {/* Custom Color Button */}
                            <div className="flex flex-col items-center gap-2 group transition-all">
                                <label
                                    className={cn(
                                        "h-12 w-12 rounded-full transition-all flex items-center justify-center shadow-lg cursor-pointer relative overflow-hidden",
                                        settings.primaryColor === 'custom' ? "ring-2 ring-offset-2 ring-slate-900" : "border-2 border-dashed border-slate-300 hover:border-slate-400"
                                    )}
                                    style={settings.primaryColor === 'custom' ? { background: settings.customColor } : {}}
                                >
                                    {settings.primaryColor === 'custom' ? (
                                        <Check className="h-5 w-5 text-white pointer-events-none z-10" />
                                    ) : (
                                        <div className="bg-gradient-to-br from-red-500 via-green-500 to-blue-500 w-full h-full opacity-50" />
                                    )}

                                    <input
                                        type="color"
                                        className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                                        value={settings.customColor || "#000000"}
                                        onChange={(e) => updateSettings({ primaryColor: 'custom', customColor: e.target.value })}
                                    />
                                </label>
                                <span className={cn(
                                    "text-xs font-medium",
                                    settings.primaryColor === 'custom' ? "text-slate-900" : "text-slate-500"
                                )}>
                                    Personnalisé
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 pt-2">
                            Le thème s'appliquera instantanément à la barre latérale, aux boutons et aux accents visuels.
                        </p>
                    </div>
                </div>
            </section>

            {/* Système de Fidélité */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Star className={cn("h-5 w-5", currentTheme.solidText)} />
                    Programme de Fidélité
                </h2>
                <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="font-bold text-slate-900">Activer la fidélité</div>
                            <div className="text-sm text-slate-500">Offrez des étoiles à chaque commande</div>
                        </div>
                        <div className={cn("h-6 w-11 rounded-full relative bg-gradient-to-r", currentTheme.gradient)}>
                            <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Nombre de commandes pour 1 étoile</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                min="1"
                                value={settings.loyaltyTarget || 10}
                                onChange={(e) => updateSettings({ loyaltyTarget: Math.max(1, parseInt(e.target.value) || 10) })}
                                className={cn(
                                    "w-24 px-4 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all",
                                    currentTheme.ringColor ? `focus:ring-${currentTheme.ringColor}/20` : "focus:ring-blue-500/20"
                                )}
                                style={settings.primaryColor === 'custom' ? { outlineColor: settings.customColor } : {}}
                            />
                            <span className="text-slate-500 text-sm">Commandes = 1 étoile</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gestion de l'équipe (Admin Only) */}
            {role === "admin" && <TeamManagement />}

            {/* Abonnement et Utilisation */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <CreditCard className={cn("h-5 w-5", currentTheme.solidText)} />
                    Abonnement & Utilisation
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500 text-sm font-medium">Commandes ce mois</span>
                            <BarChart3 className="h-5 w-5 text-slate-300" />
                        </div>
                        <div className="text-3xl font-bold">1,284</div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className={cn("h-full bg-gradient-to-r", currentTheme.gradient)} style={{ width: '65%' }} />
                        </div>
                        <div className="text-xs text-slate-500">65% du plafond (2,000)</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500 text-sm font-medium">Plan actuel</span>
                            <span className={cn("text-xs font-bold px-2 py-1 rounded", currentTheme.lightBg, currentTheme.solidText)}>PREMIUM</span>
                        </div>
                        <div className="text-2xl font-bold">Pack Business Plus</div>
                        <button className={cn("flex items-center gap-2 font-bold text-sm hover:underline transition-all", currentTheme.solidText)}>
                            Gérer mon abonnement
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer / Meta */}
            <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
                <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Version 2.4.0 (Stable)
                </div>
                <div>Dernière synchronisation: il y a 5 minutes</div>
            </div>
        </div>
    );
}

function TeamManagement() {
    const [servers, setServers] = useState<{ id: string; name: string; code: string }[]>([]);
    const [newName, setNewName] = useState("");
    const [newCode, setNewCode] = useState("");
    const { currentTheme } = useAppSettings();

    // Load servers on mount
    useEffect(() => {
        const saved = localStorage.getItem("snackServers");
        if (saved) {
            setServers(JSON.parse(saved));
        }
    }, []);

    const addServer = () => {
        if (!newName || !newCode) return;
        const newServer = { id: crypto.randomUUID(), name: newName, code: newCode };
        const updated = [...servers, newServer];
        setServers(updated);
        localStorage.setItem("snackServers", JSON.stringify(updated));
        setNewName("");
        setNewCode("");
    };

    const deleteServer = (id: string) => {
        const updated = servers.filter(s => s.id !== id);
        setServers(updated);
        localStorage.setItem("snackServers", JSON.stringify(updated));
    };

    return (
        <section className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className={cn("h-5 w-5", currentTheme.solidText)} />
                Gestion de l'équipe
            </h2>
            <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                <div className="flex flex-col gap-4">
                    <div className="font-bold text-slate-900">Serveurs enregistrés</div>

                    {/* Add Form */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <input
                            placeholder="Prénom du serveur"
                            className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-slate-200 outline-none"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                        />
                        <input
                            placeholder="Code d'accès"
                            className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-slate-200 outline-none"
                            value={newCode}
                            onChange={e => setNewCode(e.target.value)}
                        />
                        <button
                            onClick={addServer}
                            disabled={!newName || !newCode}
                            className={cn(
                                "text-white font-bold py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md bg-gradient-to-r",
                                currentTheme.gradient,
                                `shadow-${currentTheme.ringColor}/20`
                            )}
                        >
                            Ajouter
                        </button>
                    </div>

                    {/* Server List */}
                    <div className="space-y-2 mt-2">
                        {servers.length === 0 && (
                            <div className="text-center py-6 text-slate-400 italic">
                                Aucun serveur enregistré pour le moment.
                            </div>
                        )}
                        {servers.map(server => (
                            <div key={server.id} className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:border-slate-300 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center font-bold", currentTheme.lightBg, currentTheme.solidText)}>
                                        {server.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">{server.name}</div>
                                        <div className="text-xs text-slate-500 font-mono">Code: ••••</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteServer(server.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
