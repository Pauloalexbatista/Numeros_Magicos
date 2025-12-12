'use client';

import { useRouter } from 'next/navigation';

interface Props {
    systems: { name: string }[];
    selectedSystem: string;
}

export default function SystemFilterClient({ systems, selectedSystem }: Props) {
    const router = useRouter();

    return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
                Sistema:
            </label>
            <select
                value={selectedSystem}
                onChange={(e) => {
                    const url = `/admin/predictions?system=${encodeURIComponent(e.target.value)}`;
                    router.push(url);
                }}
                className="w-full md:w-96 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                {systems.map(sys => (
                    <option key={sys.name} value={sys.name}>
                        {sys.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
