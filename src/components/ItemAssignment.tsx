"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatIDR } from "@/lib/idr";
import { calculateEqualSplit, getUnclaimedItems } from "@/lib/split-calculator";
import { UserPlus, Users, AlertTriangle, Check } from "lucide-react";
import { toast } from "sonner";

interface Item {
  id: string;
  name: string;
  unitPrice: string;
  quantity: number;
}

interface Participant {
  id: string;
  displayName: string;
  userId: string | null;
}

interface Assignment {
  id?: string;
  itemId: string;
  participantId: string;
  amount: number;
}

interface ItemAssignmentProps {
  billId: string;
  items: Item[];
  participants: Participant[];
  currentUserId?: string;
  currentParticipantId?: string | null;
  isCreator: boolean;
  assignments: Assignment[];
  onAssignmentsChange: (assignments: Assignment[]) => void;
}

export function ItemAssignment({
  billId,
  items,
  participants,
  currentUserId,
  currentParticipantId,
  isCreator,
  assignments,
  onAssignmentsChange,
}: ItemAssignmentProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const currentParticipant = currentParticipantId
    ? participants.find((p) => p.id === currentParticipantId)
    : currentUserId
    ? participants.find((p) => p.userId === currentUserId)
    : null;

  const unclaimedItems = getUnclaimedItems(items, assignments);

  const claimItem = async (itemId: string, participantId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const itemTotal = parseFloat(item.unitPrice) * item.quantity;
    const newAssignment: Assignment = {
      itemId,
      participantId,
      amount: itemTotal,
    };

    try {
      const response = await fetch(`/api/bills/${billId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAssignment),
      });

      if (!response.ok) throw new Error("Failed to claim");

      onAssignmentsChange([...assignments, newAssignment]);
      toast.success("Item berhasil diklaim!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengklaim item");
    }
  };

  const claimItemEqual = async (itemId: string, participantIds: string[]) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || participantIds.length === 0) return;

    const itemTotal = parseFloat(item.unitPrice) * item.quantity;
    const splits = calculateEqualSplit(itemTotal, participantIds);

    const newAssignments: Assignment[] = splits.map((split) => ({
      itemId,
      participantId: split.participantId,
      amount: split.amount,
    }));

    try {
      const response = await fetch(`/api/bills/${billId}/assignments/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, assignments: newAssignments }),
      });

      if (!response.ok) throw new Error("Failed to split");

      // Remove old assignments for this item
      const filtered = assignments.filter((a) => a.itemId !== itemId);
      onAssignmentsChange([...filtered, ...newAssignments]);
      toast.success("Item berhasil dibagi!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal membagi item");
    }
  };

  const assignToAll = (itemId: string) => {
    claimItemEqual(itemId, participants.map((p) => p.id));
  };

  const removeAssignment = async (itemId: string, participantId: string) => {
    try {
      const response = await fetch(
        `/api/bills/${billId}/assignments?itemId=${itemId}&participantId=${participantId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to remove");

      onAssignmentsChange(
        assignments.filter(
          (a) => !(a.itemId === itemId && a.participantId === participantId)
        )
      );
      toast.success("Penugasan dihapus");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus penugasan");
    }
  };

  const getItemAssignees = (itemId: string) => {
    return assignments
      .filter((a) => a.itemId === itemId)
      .map((a) => {
        const participant = participants.find((p) => p.id === a.participantId);
        return {
          ...a,
          participantName: participant?.displayName || "Unknown",
        };
      });
  };

  const isItemFullyAssigned = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return false;
    const itemTotal = parseFloat(item.unitPrice) * item.quantity;
    const assignedTotal = assignments
      .filter((a) => a.itemId === itemId)
      .reduce((sum, a) => sum + a.amount, 0);
    return assignedTotal >= itemTotal;
  };

  return (
    <div className="space-y-4">
      {/* Unclaimed Warning */}
      {unclaimedItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">
                {unclaimedItems.length} item belum diklaim
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Klaim Item</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tap item untuk mengklaim atau membagi
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => {
            const assignees = getItemAssignees(item.id);
            const isFullyAssigned = isItemFullyAssigned(item.id);
            const itemTotal = parseFloat(item.unitPrice) * item.quantity;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-lg border transition-colors ${
                  selectedItem === item.id
                    ? "border-primary bg-primary/5"
                    : isFullyAssigned
                    ? "bg-green-50 border-green-200"
                    : "bg-muted"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatIDR(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatIDR(itemTotal)}</p>
                    {isFullyAssigned && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Selesai
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Assignees */}
                {assignees.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {assignees.map((a, index) => (
                      <Badge key={index} variant="outline">
                        {a.participantName}: {formatIDR(a.amount)}
                        {(isCreator || a.participantId === currentParticipantId) && (
                          <button
                            onClick={() => removeAssignment(item.id, a.participantId)}
                            className="ml-2 text-destructive hover:text-destructive/80"
                          >
                            ×
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {currentParticipant && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => claimItem(item.id, currentParticipant.id)}
                      disabled={assignees.some(
                        (a) => a.participantId === currentParticipant.id
                      )}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Klaim
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => assignToAll(item.id)}
                    disabled={participants.length === 0}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Semua ({participants.length})
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
