import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Receipt } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Kelola tagihan bersama kamu</p>
        </div>
        <Link href="/bill/baru">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tagihan Baru
          </Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/bill/baru">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Buat Tagihan Baru</CardTitle>
                  <CardDescription>
                    Mulai tagihan untuk dibagi
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/grup">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Kelola Grup</CardTitle>
                  <CardDescription>
                    Grup untuk tagihan rutin
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Empty State */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Receipt className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-4 text-center">
            Belum ada tagihan. Buat tagihan pertama untuk mulai membagi!
          </p>
          <Link href="/bill/baru">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Buat Tagihan
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
