"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, CreditCard, Pencil, Check } from "lucide-react";
import { toast } from "sonner";

interface PaymentInfoData {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface PaymentInfoProps {
  billId: string;
  paymentInfo: PaymentInfoData | null;
  isCreator: boolean;
  onSave?: (info: PaymentInfoData) => void;
}

export function PaymentInfo({ billId, paymentInfo, isCreator, onSave }: PaymentInfoProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PaymentInfoData>(
    paymentInfo || { bankName: "", accountNumber: "", accountName: "" }
  );

  const copyAccountNumber = () => {
    if (!paymentInfo?.accountNumber) return;
    navigator.clipboard.writeText(paymentInfo.accountNumber);
    toast.success("Nomor rekening berhasil disalin!");
  };

  const copyAll = () => {
    if (!paymentInfo) return;
    const text = `${paymentInfo.bankName}\n${paymentInfo.accountNumber}\na.n ${paymentInfo.accountName}`;
    navigator.clipboard.writeText(text);
    toast.success("Info pembayaran berhasil disalin!");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/bills/${billId}/payment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save");

      onSave?.(formData);
      setEditing(false);
      toast.success("Info pembayaran disimpan!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan info pembayaran");
    } finally {
      setSaving(false);
    }
  };

  if (!isCreator && !paymentInfo) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Info Pembayaran
          </CardTitle>
          {isCreator && !editing && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Nama Bank</Label>
              <Input
                id="bankName"
                placeholder="BCA, Mandiri, dll"
                value={formData.bankName}
                onChange={(e) =>
                  setFormData({ ...formData, bankName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Nomor Rekening</Label>
              <Input
                id="accountNumber"
                placeholder="1234567890"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountName">Nama Pemilik</Label>
              <Input
                id="accountName"
                placeholder="John Doe"
                value={formData.accountName}
                onChange={(e) =>
                  setFormData({ ...formData, accountName: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Batal
              </Button>
            </div>
          </div>
        ) : paymentInfo ? (
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank</span>
                <span className="font-medium">{paymentInfo.bankName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">No. Rekening</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium">
                    {paymentInfo.accountNumber}
                  </span>
                  <Button variant="ghost" size="icon" onClick={copyAccountNumber}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Atas Nama</span>
                <span className="font-medium">{paymentInfo.accountName}</span>
              </div>
            </div>
            <Button onClick={copyAll} variant="outline" className="w-full">
              <Copy className="h-4 w-4 mr-2" />
              Salin Semua
            </Button>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>Belum ada info pembayaran</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => setEditing(true)}
            >
              Tambah Info Pembayaran
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
