"use client";

import { useEffect, useState } from "react";
import { getAllTenants, updateTenantPlan, updateTenantStatus, deleteTenant } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  plan: string;
  status: string;
  createdAt: Date;
  _count: {
    users: number;
    memberships: number;
    tasks: number;
  };
  usageCounter: {
    taskCount: number;
  } | null;
}

export default function AdminPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    const result = await getAllTenants();
    if (result.error) {
      setError(result.error);
    } else if (result.tenants) {
      setTenants(result.tenants as Tenant[]);
    }
    setLoading(false);
  };

  const handlePlanChange = async (tenantId: string, plan: "free" | "premium" | "premium_plus") => {
    const result = await updateTenantPlan(tenantId, plan);
    if (result.error) {
      alert(result.error);
    } else {
      await loadTenants();
    }
  };

  const handleStatusChange = async (tenantId: string, status: string) => {
    const result = await updateTenantStatus(tenantId, status);
    if (result.error) {
      alert(result.error);
    } else {
      await loadTenants();
    }
  };

  const handleDelete = async (tenantId: string, tenantName: string) => {
    if (!confirm(`Are you sure you want to delete "${tenantName}"? This action cannot be undone.`)) {
      return;
    }
    
    const result = await deleteTenant(tenantId);
    if (result.error) {
      alert(result.error);
    } else {
      await loadTenants();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading tenants...</div>;
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
        <h1 className="text-3xl font-bold">Tenant Management</h1>
        <p className="text-gray-600 mt-2">Manage all tenants, plans, and usage. Visit the &ldquo;All Users&rdquo; tab to manage users across all tenants.</p>
      </div>

      <div className="grid gap-6">
        {tenants.map((tenant) => (
          <Card key={tenant.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{tenant.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {tenant.subdomain} • Created {new Date(tenant.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    tenant.plan === 'premium_plus' ? 'bg-purple-100 text-purple-800' :
                    tenant.plan === 'premium' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tenant.plan.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    tenant.status === 'active' ? 'bg-green-100 text-green-800' :
                    tenant.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {tenant.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Members</p>
                  <p className="text-2xl font-bold">{tenant._count.memberships}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Tasks</p>
                  <p className="text-2xl font-bold">{tenant.usageCounter?.taskCount || 0}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold">{tenant._count.tasks}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Users</p>
                  <p className="text-2xl font-bold">{tenant._count.users}</p>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <label className="text-xs text-gray-600 mb-1 block">Change Plan</label>
                  <select
                    value={tenant.plan}
                    onChange={(e) => handlePlanChange(tenant.id, e.target.value as "free" | "premium" | "premium_plus")}
                    className="w-full px-3 py-2 border rounded text-sm"
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                    <option value="premium_plus">Premium Plus</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-600 mb-1 block">Change Status</label>
                  <select
                    value={tenant.status}
                    onChange={(e) => handleStatusChange(tenant.id, e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="deleted">Deleted</option>
                  </select>
                </div>
                <div className="pt-5">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(tenant.id, tenant.name)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {tenants.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-gray-600">
              No tenants found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
