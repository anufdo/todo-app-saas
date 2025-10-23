"use client";

import { useEffect, useState } from "react";
import { getAllUsers, updateUserRole, deleteUser } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  memberships: Array<{
    id: string;
    role: string;
    tenant: {
      id: string;
      name: string;
      subdomain: string;
    };
  }>;
  _count: {
    tasks: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const result = await getAllUsers();
    if (result.error) {
      setError(result.error);
    } else if (result.users) {
      setUsers(result.users as User[]);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, tenantId: string, role: string) => {
    const result = await updateUserRole(userId, tenantId, role);
    if (result.error) {
      alert(result.error);
    } else {
      await loadUsers();
    }
  };

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      return;
    }
    
    const result = await deleteUser(userId);
    if (result.error) {
      alert(result.error);
    } else {
      await loadUsers();
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.memberships.some(m => m.tenant.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-gray-600 mt-2">Manage all users across all tenants</p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or tenant..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenants & Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tasks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || "Unnamed User"}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    {user.memberships.length === 0 ? (
                      <span className="text-sm text-gray-400 italic">No tenants</span>
                    ) : (
                      user.memberships.map((membership) => (
                        <div key={membership.id} className="flex items-center gap-2">
                          <span className="text-sm text-gray-900">
                            {membership.tenant.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({membership.tenant.subdomain})
                          </span>
                          <select
                            value={membership.role}
                            onChange={(e) => handleRoleChange(user.id, membership.tenant.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded-full border ${
                              membership.role === "admin"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : membership.role === "owner"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                          >
                            <option value="member">Member</option>
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      ))
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user._count.tasks}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(user.id, user.email)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? "No users found matching your search" : "No users found"}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Total users: {filteredUsers.length}
      </div>
    </div>
  );
}
