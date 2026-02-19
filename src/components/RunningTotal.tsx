"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatIDR } from "@/lib/idr";
import { ChevronUp, ChevronDown, Wallet } from "lucide-react";
import { calculateParticipantTotal } from "@/lib/split-calculator";

interface Assignment {
  itemId: string;
  participantId: string;
  amount: number;
}

interface Item {
  id: string;
  name: string;
}

interface RunningTotalProps {
  currentParticipantId: string;
  currentParticipantName: string;
  assignments: Assignment[];
  items: Item[];
}

export function RunningTotal({
  currentParticipantId,
  currentParticipantName,
  assignments,
  items,
}: RunningTotalProps) {
  const [expanded, setExpanded] = useState(false);

  const myAssignments = assignments.filter(
    (a) => a.participantId === currentParticipantId
  );

  const total = calculateParticipantTotal(currentParticipantId, assignments);

  const breakdown = myAssignments.map((a) => {
    const item = items.find((i) => i.id === a.itemId);
    return {
      itemName: item?.name || "Unknown",
      amount: a.amount,
    };
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
      <Card className="rounded-none border-0">
        <CardContent className="p-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">
                  Total kamu ({currentParticipantName})
                </p>
                <p className="text-xl font-bold">{formatIDR(total)}</p>
              </div>
            </div>
            {expanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {expanded && breakdown.length > 0 && (
            <div className="mt-4 pt-4 border-t space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Rincian:
              </p>
              {breakdown.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{item.itemName}</span>
                  <span>{formatIDR(item.amount)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatIDR(total)}</span>
              </div>
            </div>
          )}

          {expanded && breakdown.length === 0 && (
            <div className="mt-4 pt-4 border-t text-center text-muted-foreground">
              <p>Kamu belum mengklaim item apapun</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
