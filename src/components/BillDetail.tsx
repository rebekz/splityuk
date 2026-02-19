"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatIDR } from "@/lib/idr";
import { Loader2, Share2, Lock, Unlock, Users } from "lucide-react";
import { toast } from "sonner";
import { ItemForm } from "./ItemForm";
import { Charge } from "@/lib/schema";

interface BillDetailProps {
  billId: string;
}

interface Bill {
  id: string;
  name: string;
  date: Date;
  status: string;
  shareCode: string;
  creatorId: string;
}

interface Item {
  id?: string;
  name: string;
  unitPrice: string;
  quantity: number;
}

interface Participant {
  id: string;
  displayName: string;
  userId: string | null;
  userName: string | null;
}

export function BillDetail({ billId }: BillDetailProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bill, setBill] = useState<Bill | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    fetchBill();
  }, [billId]);

  const fetchBill = async () => {
    try {
      const response = await fetch(`/api/bills/${billId}`);
      if (!response.ok) throw new Error("Failed to fetch bill");
      
      const data = await response.json();
      setBill(data.bill);
      setItems(data.items || []);
      setCharges(data.charges || []);
      setParticipants(data.participants || []);
      setIsCreator(data.isCreator);
      setIsLocked(data.bill.status === "settled");
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat tagihan");
    } finally {
      setLoading(false);
    }
  };

  const saveItems = async () => {
    setSaving(true);
    try {
      // Save items
      for (const item of items) {
        if (item.id) {
          await fetch(`/api/bills/${billId}/items`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId: item.id, ...item }),
          });
        } else {
          await fetch(`/api/bills/${billId}/items`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          });
        }
      }
      toast.success("Item disimpan");
      fetchBill();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan item");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/b/${bill?.shareCode}`;
    navigator.clipboard.writeText(url);
    toast.success("Link berhasil disalin!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!bill) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Tagihan tidak ditemukan</p>
        </CardContent>
      </Card>
    );
  }

  const subtotal = items.reduce((sum, item) => {
    return sum + parseFloat(item.unitPrice) * item.quantity;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{bill.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(bill.date).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={bill.status === "active" ? "default" : "secondary"}>
                {bill.status === "active" ? "Aktif" : "Selesai"}
              </Badge>
              {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button onClick={handleShare} variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Bagikan
            </Button>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="mr-2 h-4 w-4" />
              {participants.length} orang
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Form */}
      {!isLocked && isCreator && (
        <>
          <ItemForm
            items={items}
            onItemsChange={setItems}
            charges={charges}
            onChargesChange={setCharges}
          />
          <Button onClick={saveItems} disabled={saving} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </>
      )}

      {/* Read-only View */}
      {(isLocked || !isCreator) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daftar Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatIDR(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
                <span className="font-semibold">
                  {formatIDR(parseFloat(item.unitPrice) * item.quantity)}
                </span>
              </div>
            ))}
            <Separator className="my-4" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatIDR(subtotal)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
