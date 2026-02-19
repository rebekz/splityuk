"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatIDR, parseIDR } from "@/lib/idr";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Charge } from "@/lib/schema";

interface Item {
  id?: string;
  name: string;
  unitPrice: string;
  quantity: number;
}

interface ItemFormProps {
  items: Item[];
  onItemsChange: (items: Item[]) => void;
  charges: Charge[];
  onChargesChange: (charges: Charge[]) => void;
}

export function ItemForm({ items, onItemsChange, charges, onChargesChange }: ItemFormProps) {
  const [newItem, setNewItem] = useState<Item>({ name: "", unitPrice: "0", quantity: 1 });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showChargeForm, setShowChargeForm] = useState(false);
  const [newCharge, setNewCharge] = useState<{
    type: "tax" | "service" | "discount";
    value: string;
    isPercentage: boolean;
  }>({ type: "tax", value: "10", isPercentage: true });

  const addItem = () => {
    if (!newItem.name || parseFloat(newItem.unitPrice) <= 0) return;
    
    if (editingIndex !== null) {
      const updated = [...items];
      updated[editingIndex] = newItem;
      onItemsChange(updated);
      setEditingIndex(null);
    } else {
      onItemsChange([...items, newItem]);
    }
    setNewItem({ name: "", unitPrice: "0", quantity: 1 });
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const editItem = (index: number) => {
    setNewItem(items[index]);
    setEditingIndex(index);
  };

  const addCharge = () => {
    if (parseFloat(newCharge.value) <= 0) return;
    
    const charge: Charge = {
      id: crypto.randomUUID(),
      billId: "",
      type: newCharge.type,
      value: newCharge.value,
      isPercentage: newCharge.isPercentage,
      createdAt: new Date(),
    };
    onChargesChange([...charges, charge]);
    setNewCharge({ type: "tax", value: "10", isPercentage: true });
    setShowChargeForm(false);
  };

  const removeCharge = (index: number) => {
    onChargesChange(charges.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      return sum + parseFloat(item.unitPrice) * item.quantity;
    }, 0);
  };

  const calculateCharges = (subtotal: number) => {
    let total = subtotal;
    const chargeDetails: { name: string; amount: number }[] = [];

    // Calculate charges in order: discount first, then tax, then service
    const sortedCharges = [...charges].sort((a, b) => {
      const order = { discount: 0, tax: 1, service: 2, other: 3 };
      return order[a.type] - order[b.type];
    });

    for (const charge of sortedCharges) {
      let amount: number;
      if (charge.isPercentage) {
        amount = total * (parseFloat(charge.value) / 100);
      } else {
        amount = parseFloat(charge.value);
      }

      if (charge.type === "discount") {
        amount = -amount;
      }

      total += amount;
      chargeDetails.push({
        name: `${charge.type === "tax" ? "Pajak" : charge.type === "service" ? "Layanan" : "Diskon"} (${charge.isPercentage ? `${charge.value}%` : formatIDR(charge.value)})`,
        amount,
      });
    }

    return { total, chargeDetails };
  };

  const subtotal = calculateSubtotal();
  const { total: grandTotal, chargeDetails } = calculateCharges(subtotal);

  const chargeTypeLabels = {
    tax: "Pajak",
    service: "Layanan",
    discount: "Diskon",
    other: "Lainnya",
  };

  return (
    <div className="space-y-6">
      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Belum ada item. Tambahkan item pertama!
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatIDR(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {formatIDR(parseFloat(item.unitPrice) * item.quantity)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => editItem(index)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add/Edit Item Form */}
          <div className="border-t pt-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="itemName">Nama Item</Label>
                <Input
                  id="itemName"
                  placeholder="Nasi Goreng"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="itemPrice">Harga (Rp)</Label>
                <Input
                  id="itemPrice"
                  placeholder="25000"
                  value={newItem.unitPrice === "0" ? "" : newItem.unitPrice}
                  onChange={(e) =>
                    setNewItem({ ...newItem, unitPrice: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="itemQty">Jumlah</Label>
                <Input
                  id="itemQty"
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            </div>
            <Button onClick={addItem} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {editingIndex !== null ? "Simpan Perubahan" : "Tambah Item"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pajak, Layanan & Diskon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {charges.length > 0 && (
            <div className="space-y-2">
              {charges.map((charge, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{chargeTypeLabels[charge.type]}</p>
                    <p className="text-sm text-muted-foreground">
                      {charge.isPercentage ? `${charge.value}%` : formatIDR(charge.value)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCharge(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {showChargeForm ? (
            <div className="border-t pt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Jenis</Label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={newCharge.type}
                    onChange={(e) =>
                      setNewCharge({
                        ...newCharge,
                        type: e.target.value as "tax" | "service" | "discount",
                      })
                    }
                  >
                    <option value="tax">Pajak</option>
                    <option value="service">Layanan</option>
                    <option value="discount">Diskon</option>
                  </select>
                </div>
                <div>
                  <Label>Nilai</Label>
                  <Input
                    type="number"
                    value={newCharge.value}
                    onChange={(e) =>
                      setNewCharge({ ...newCharge, value: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Tipe</Label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={newCharge.isPercentage ? "percent" : "fixed"}
                    onChange={(e) =>
                      setNewCharge({
                        ...newCharge,
                        isPercentage: e.target.value === "percent",
                      })
                    }
                  >
                    <option value="percent">Persentase (%)</option>
                    <option value="fixed">Nominal (Rp)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addCharge} className="flex-1">
                  Tambah
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowChargeForm(false)}
                >
                  Batal
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowChargeForm(true)}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pajak/Diskon
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ringkasan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatIDR(subtotal)}</span>
            </div>
            {chargeDetails.map((charge, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{charge.name}</span>
                <span className={charge.amount < 0 ? "text-green-600" : ""}>
                  {charge.amount < 0 ? "-" : ""}{formatIDR(Math.abs(charge.amount))}
                </span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
              <span>Total</span>
              <span>{formatIDR(grandTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
