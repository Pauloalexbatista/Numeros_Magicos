'use client'
import { upgradeToPro } from "@/app/actions/subscription"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function UpgradeButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUpgrade = async () => {
        setLoading(true);
        await upgradeToPro();
        setLoading(false);
        // Force a hard reload to ensure session is updated
        window.location.href = "/analysis/advanced";
    };

    return (
        <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50"
        >
            {loading ? "A Processar..." : "🚀 Fazer Upgrade para PRO"}
        </button>
    )
}
