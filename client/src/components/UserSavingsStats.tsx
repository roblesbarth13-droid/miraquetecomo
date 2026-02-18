import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, Leaf, Package, Sparkles } from "lucide-react";
import type { PurchaseWithOfferAndUser } from "@shared/schema";

const MONTHS_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const CO2_PER_KG_FOOD = 2.5;
const AVG_KG_PER_OFFER = 1.5;

interface UserSavingsStatsProps {
  purchases: PurchaseWithOfferAndUser[];
}

export function UserSavingsStats({ purchases }: UserSavingsStatsProps) {
  const paidPurchases = useMemo(
    () => purchases.filter((p) => p.paymentStatus === "pagado"),
    [purchases]
  );

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: {
      month: string;
      saved: number;
      paid: number;
      co2Saved: number;
    }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${MONTHS_ES[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;

      const monthPurchases = paidPurchases.filter((p) => {
        if (!p.createdAt) return false;
        const pd = new Date(p.createdAt);
        return (
          pd.getFullYear() === d.getFullYear() &&
          pd.getMonth() === d.getMonth()
        );
      });

      const paid = monthPurchases.reduce(
        (acc, p) => acc + parseFloat(p.offer?.discountedPrice || "0"),
        0
      );
      const original = monthPurchases.reduce(
        (acc, p) => acc + parseFloat(p.offer?.originalPrice || "0"),
        0
      );

      months.push({
        month: label,
        saved: Math.round(original - paid),
        paid: Math.round(paid),
        co2Saved: parseFloat((monthPurchases.length * AVG_KG_PER_OFFER * CO2_PER_KG_FOOD).toFixed(1)),
      });
    }
    return months;
  }, [paidPurchases]);

  const totals = useMemo(() => {
    const totalPaid = paidPurchases.reduce(
      (acc, p) => acc + parseFloat(p.offer?.discountedPrice || "0"),
      0
    );
    const totalOriginal = paidPurchases.reduce(
      (acc, p) => acc + parseFloat(p.offer?.originalPrice || "0"),
      0
    );
    const totalSaved = totalOriginal - totalPaid;
    const totalFoodSaved = paidPurchases.length * AVG_KG_PER_OFFER;
    const totalCo2Saved = totalFoodSaved * CO2_PER_KG_FOOD;

    return {
      totalPaid,
      totalOriginal,
      totalSaved,
      totalFoodSaved,
      totalCo2Saved,
      totalPurchases: paidPurchases.length,
    };
  }, [paidPurchases]);

  if (paidPurchases.length === 0) return null;

  return (
    <div className="space-y-6 mb-8" data-testid="user-savings-stats">
      <h2 className="text-lg font-semibold">Tu impacto</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ahorraste</p>
                <p className="text-xl font-bold" data-testid="stat-user-total-saved">
                  ${totals.totalSaved.toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">CO2 evitado</p>
                <p className="text-xl font-bold" data-testid="stat-user-co2-saved">
                  {totals.totalCo2Saved.toFixed(1)} kg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Package className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Comida salvada</p>
                <p className="text-xl font-bold" data-testid="stat-user-food-saved">
                  {totals.totalFoodSaved.toFixed(1)} kg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Compras</p>
                <p className="text-xl font-bold" data-testid="stat-user-total-purchases">
                  {totals.totalPurchases}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ahorro mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 12 }} />
              <YAxis className="text-xs" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const label = name === "saved" ? "Ahorraste" : "Pagaste";
                  return [`$${value.toLocaleString("es-AR")}`, label];
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="saved" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} name="saved" />
              <Bar dataKey="paid" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="paid" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-green-200 dark:border-green-800">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-green-800 dark:text-green-300 mb-1">
                Tu aporte al planeta
              </p>
              <p className="text-sm text-muted-foreground">
                Con tus {totals.totalPurchases} compras, ayudaste a salvar <strong>{totals.totalFoodSaved.toFixed(1)} kg de comida</strong> y
                evitaste <strong>{totals.totalCo2Saved.toFixed(1)} kg de CO2</strong>.
                Ademas, ahorraste <strong>${totals.totalSaved.toLocaleString("es-AR")}</strong> comparado con comprar a precio original.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
