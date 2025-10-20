"use client";

import { useEffect, useState } from "react";
import { getTeams, createTeam, getTenantMembers, addTeamMember, removeTeamMember, deleteTeam } from "@/app/actions/team";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Team {
  id: string;
  name: string;
  description: string | null;
  _count: {
    members: number;
    tasks: number;
  };
  members: Array<{
    id: string;
    role: string;
    user: {
      name: string | null;
      email: string;
    };
  }>;
}

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [requiresUpgrade, setRequiresUpgrade] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    const [teamsResult, membersResult] = await Promise.all([
      getTeams(),
      getTenantMembers()
    ]);
    
    if (teamsResult.error) {
      setError(teamsResult.error);
      if (teamsResult.requiresUpgrade) {
        setRequiresUpgrade(true);
      }
    } else if (teamsResult.teams) {
      setTeams(teamsResult.teams as Team[]);
    }
    
    if (membersResult.success && membersResult.members) {
      setMembers(membersResult.members as Member[]);
    }
    
    setLoading(false);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await createTeam({
      name: newTeamName,
      description: newTeamDescription || undefined
    });
    
    if (result.error) {
      setError(result.error);
    } else {
      setNewTeamName("");
      setNewTeamDescription("");
      setShowCreateForm(false);
      await loadData();
    }
  };

  const handleAddMember = async (teamId: string, userId: string, role: "manager" | "member") => {
    const result = await addTeamMember(teamId, userId, role);
    
    if (result.error) {
      setError(result.error);
    } else {
      await loadData();
    }
  };

  const handleRemoveMember = async (teamId: string, userId: string) => {
    if (!confirm("Remove this member from the team?")) return;
    
    const result = await removeTeamMember(teamId, userId);
    
    if (result.error) {
      setError(result.error);
    } else {
      await loadData();
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Delete team "${teamName}"? This action cannot be undone.`)) return;
    
    const result = await deleteTeam(teamId);
    
    if (result.error) {
      setError(result.error);
    } else {
      await loadData();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading teams...</div>;
  }

  if (requiresUpgrade) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Teams</h1>
        
        <Card>
          <CardContent className="py-12">
            <div className="text-center max-w-2xl mx-auto">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold mb-4">Teams Feature Requires Premium Plus</h2>
              <p className="text-gray-600 mb-6">
                Upgrade to Premium Plus to unlock team management, manager/member hierarchy, and advanced collaboration features.
              </p>
              <Button
                onClick={() => window.location.href = '/app/settings'}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Upgrade to Premium Plus
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-gray-600 mt-2">Manage teams and assign members with roles</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          Create Team
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Team</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Engineering, Marketing, Sales..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="teamDescription">Description (Optional)</Label>
                <Textarea
                  id="teamDescription"
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  placeholder="Brief description of the team's purpose"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Team</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {teams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            No teams yet. Create your first team to get started!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{team.name}</CardTitle>
                    {team.description && (
                      <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTeam(team.id, team.name)}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Members</p>
                    <p className="text-2xl font-bold">{team._count.members}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Tasks</p>
                    <p className="text-2xl font-bold">{team._count.tasks}</p>
                  </div>
                  <div></div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Team Members</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedTeam(selectedTeam === team.id ? null : team.id)}
                    >
                      {selectedTeam === team.id ? "Cancel" : "Add Member"}
                    </Button>
                  </div>

                  {selectedTeam === team.id && (
                    <div className="bg-gray-50 p-4 rounded space-y-2">
                      <Label>Select Member to Add</Label>
                      <div className="space-y-2">
                        {members.map((member) => {
                          const isAlreadyMember = team.members.some(m => m.user.email === member.user.email);
                          return (
                            <div key={member.user.id} className="flex items-center justify-between bg-white p-2 rounded">
                              <span className="text-sm">
                                {member.user.name || member.user.email}
                              </span>
                              {isAlreadyMember ? (
                                <span className="text-xs text-gray-500">Already a member</span>
                              ) : (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAddMember(team.id, member.user.id, "member")}
                                  >
                                    Add as Member
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddMember(team.id, member.user.id, "manager")}
                                  >
                                    Add as Manager
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {team.members.length === 0 ? (
                      <p className="text-sm text-gray-600">No members yet</p>
                    ) : (
                      team.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <div>
                            <p className="font-medium">{member.user.name || member.user.email}</p>
                            <p className="text-xs text-gray-600">{member.user.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                              member.role === 'manager' 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {member.role.toUpperCase()}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveMember(team.id, member.user.email)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
