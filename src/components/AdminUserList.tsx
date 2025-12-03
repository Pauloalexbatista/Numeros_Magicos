'use client'
import { updateUserRole } from "@/app/actions/admin"
import { useState } from "react"

export default function AdminUserList({ users }: { users: any[] }) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleRoleChange = async (userId: string, newRole: string) => {
        setLoading(userId);
        await updateUserRole(userId, newRole);
        setLoading(null);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400">
                    <tr>
                        <th className="p-4">User</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Joined</th>
                        <th className="p-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="border-b border-zinc-100 dark:border-zinc-800">
                            <td className="p-4 font-medium flex items-center gap-2">
                                {user.image && <img src={user.image} alt="" className="w-8 h-8 rounded-full" />}
                                {user.name || "No Name"}
                            </td>
                            <td className="p-4 text-zinc-500">{user.email}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                        user.role === 'PRO' ? 'bg-indigo-100 text-indigo-800' :
                                            'bg-zinc-100 text-zinc-800'
                                    }`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="p-4 text-zinc-500">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                                <select
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    disabled={loading === user.id}
                                    className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 text-xs"
                                >
                                    <option value="USER">USER</option>
                                    <option value="PRO">PRO</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                                {loading === user.id && <span className="ml-2 text-xs text-zinc-400">Saving...</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
