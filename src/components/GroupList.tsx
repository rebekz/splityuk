"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, ArrowRight, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface GroupMember {
  id: string;
  displayName: string;
}

interface Group {
  id: string;
  name: string;
  members: GroupMember[];
  createdAt: Date;
}

export function GroupList() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [tempMembers, setTempMembers] = useState<string[]>([]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/groups");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addTempMember = () => {
    if (!newMemberName.trim()) return;
    setTempMembers([...tempMembers, newMemberName.trim()]);
    setNewMemberName("");
  };

  const removeTempMember = (index: number) => {
    setTempMembers(tempMembers.filter((_, i) => i !== index));
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error("Nama grup harus diisi");
      return;
    }

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGroupName,
          members: tempMembers,
        }),
      });

      if (!response.ok) throw new Error("Failed to create");

      toast.success("Grup berhasil dibuat!");
      setNewGroupName("");
      setTempMembers([]);
      setShowForm(false);
      fetchGroups();
    } catch (error) {
      console.error(error);
      toast.error("Gagal membuat grup");
    }
  };

  const deleteGroup = async (groupId: string) => {
    if (!confirm("Hapus grup ini?")) return;

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Grup dihapus");
      setGroups(groups.filter((g) => g.id !== groupId));
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus grup");
    }
  };

  const startBillFromGroup = (groupId: string) => {
    router.push(`/bill/baru?group=${groupId}`);
  };

  return (
    <div className="space-y-6">
      {/* Create Group Form */}
      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Buat Grup Baru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Grup</Label>
              <Input
                placeholder="Tim Project A"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tambah Anggota</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nama anggota"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTempMember()}
                />
                <Button onClick={addTempMember} type="button">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {tempMembers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tempMembers.map((member, index) => (
                  <Badge key={index} variant="secondary">
                    {member}
                    <button
                      onClick={() => removeTempMember(index)}
                      className="ml-2 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={createGroup}>Buat Grup</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Buat Grup Baru
        </Button>
      )}

      {/* Groups List */}
      <div className="grid gap-4">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteGroup(group.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{group.members.length} anggota</span>
                </div>
                <Button onClick={() => startBillFromGroup(group.id)}>
                  Mulai Tagihan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              {group.members.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {group.members.slice(0, 5).map((member) => (
                    <Badge key={member.id} variant="outline">
                      {member.displayName}
                    </Badge>
                  ))}
                  {group.members.length > 5 && (
                    <Badge variant="outline">
                      +{group.members.length - 5} lainnya
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {groups.length === 0 && !showForm && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Belum ada grup. Buat grup untuk memulai tagihan lebih cepat!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
