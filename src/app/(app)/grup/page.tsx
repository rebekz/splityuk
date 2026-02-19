import { BillHistory } from "@/components/BillHistory";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GrupPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grup</h1>
          <p className="text-muted-foreground">
            Kelompok orang untuk tagihan rutin
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder groups */}
        <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">
          <p>Fitur grup akan segera hadir!</p>
          <p className="text-sm mt-2">
            Anda akan bisa membuat grup orang untuk tagihan rutin.
          </p>
        </div>
      </div>

      <Link href="/bill/baru">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Buat Tagihan Baru
        </Button>
      </Link>
    </div>
  );
}
