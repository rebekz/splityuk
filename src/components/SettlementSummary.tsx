"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatIDR } from "@/lib/idr";
import { formatSplitSummary } from "@/lib/split-calculator";
import { Check, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ParticipantTotal {
  participantId: string;
  participantName: string;
  amount: number;
  isPaid: boolean;
}

interface SettlementSummaryProps {
  billId: string;
  billName: string;
  participants: ParticipantTotal[];
  isCreator: boolean;
  onTogglePaid: (participantId: string, isPaid: boolean) => void;
}

export function SettlementSummary({
  billId,
  billName,
  participants,
  isCreator,
  onTogglePaid,
}: SettlementSummaryProps) {
  const total = participants.reduce((sum, p) => sum + p.amount, 0);
  const paidTotal = participants
    .filter((p) => p.isPaid)
    .reduce((sum, p) => sum + p.amount, 0);
  const unpaidTotal = total - paidTotal;

  const copySummary = () => {
    const summary = formatSplitSummary(
      billName,
      participants.map((p) => ({
        participantId: p.participantId,
        participantName: p.participantName,
        amount: p.amount,
        items: [],
      }))
    );
    navigator.clipboard.writeText(summary);
    toast.success("Ringkasan berhasil disalin!");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Ringkasan Pembagian</CardTitle>
          <Button onClick={copySummary} variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Salin
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{formatIDR(total)}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{formatIDR(paidTotal)}</p>
            <p className="text-xs text-muted-foreground">Lunas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">{formatIDR(unpaidTotal)}</p>
            <p className="text-xs text-muted-foreground">Belum Bayar</p>
          </div>
        </div>

        <Separator />

        {/* Participant List */}
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.participantId}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    participant.isPaid
                      ? "bg-green-100 text-green-600"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {participant.isPaid ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-bold">
                      {participant.participantName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium">{participant.participantName}</p>
                  <Badge
                    variant={participant.isPaid ? "secondary" : "outline"}
                    className={participant.isPaid ? "bg-green-100 text-green-800" : ""}
                  >
                    {participant.isPaid ? "Lunas" : "Belum bayar"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{formatIDR(participant.amount)}</span>
                {isCreator && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTogglePaid(participant.participantId, !participant.isPaid)}
                  >
                    {participant.isPaid ? "Tandai Belum" : "Tandai Lunas"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {participants.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            Belum ada peserta yang mengklaim item
          </p>
        )}
      </CardContent>
    </Card>
  );
}
