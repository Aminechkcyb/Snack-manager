"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
}

export function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Supprimer la commande ?",
    description = "Cette action est irréversible. La commande sera définitivement effacée de l'historique."
}: DeleteModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Lock scroll when open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header with red background pattern */}
                <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600 shadow-sm">
                        <Trash2 className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">{title}</h2>
                    <p className="text-slate-500 text-sm">{description}</p>
                </div>

                {/* Actions */}
                <div className="p-4 flex flex-col gap-3 bg-white">
                    <button
                        onClick={onConfirm}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] shadow-red-200 shadow-lg"
                    >
                        <Trash2 className="h-5 w-5" />
                        Oui, supprimer
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
