import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your shared bills</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Bill
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder bills */}
        {[1, 2, 3].map((i) => (
          <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Bill #{i}</CardTitle>
              <CardDescription>Restaurant dinner</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">Rp 450.000</span>
                <span className="text-sm text-muted-foreground">4 people</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No bills yet. Create your first bill to start splitting!</p>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Create Bill
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
