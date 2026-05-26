import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { DollarSign, Leaf, Package, TrendingUp } from "lucide-react";
import type { PurchaseWithOfferAndUser, OfferWithBusiness } from "@shared/schema";

const MONTHS_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const CO2_PER_KG_FOOD = 2.5;
const AVG_KG_PER_OFFER = 1.5;

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

interface BusinessStatsProps {
  sales: PurchaseWithOfferAndUser[];
  offers: OfferWithBusiness[];
}

export function BusinessStats({ sales, offers }: BusinessStatsProps) {
  const paidSales = useMemo(
    () => sales.filter((s) => s.paymentStatus === "pagado"),
    [sales]
  );

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: {
      month: string;
      revenue: number;
      sales: number;
      co2Saved: number;
      foodSaved: number;
    }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = `${MONTHS_ES[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;

      const monthSales = paidSales.filter((s) => {
        if (!s.createdAt) return false;
        const sd = new Date(s.createdAt);
        return (
          sd.getFullYear() === d.getFullYear() &&
          sd.getMonth() === d.getMonth()
        );
      });

      const revenue = monthSales.reduce(
        (acc, s) => acc + parseFloat(s.offer?.discountedPrice || "0"),
        0
      );
      const foodSavedKg = monthSales.length * AVG_KG_PER_OFFER;

      months.push({
        month: label,
        revenue: Math.round(revenue),
        sales: monthSales.length,
        co2Saved: parseFloat((foodSavedKg * CO2_PER_KG_FOOD).toFixed(1)),
        foodSaved: parseFloat(foodSavedKg.toFixed(1)),
      });
    }
    return months;
  }, [paidSales]);

  const totals = useMemo(() => {
    const totalRevenue = paidSales.reduce(
      (acc, s) => acc + parseFloat(s.offer?.discountedPrice || "0"),
      0
    );
    const totalFoodSaved = paidSales.length * AVG_KG_PER_OFFER;
    const totalCo2Saved = totalFoodSaved * CO2_PER_KG_FOOD;
    const wastedValue = paidSales.reduce(
      (acc, s) => acc + parseFloat(s.offer?.originalPrice || "0"),
      0
    );
    const savedFromWaste = wastedValue - totalRevenue;

    return {
      totalRevenue,
      totalFoodSaved,
      totalCo2Saved,
      totalSales: paidSales.length,
      savedFromWaste,
    };
  }, [paidSales]);

  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    paidSales.forEach((s) => {
      const cat = s.offer?.category || "otro";
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    const catNames: Record<string, string> = {
      panaderia: "Panaderia",
      verduleria: "Verduleria",
      carniceria: "Carniceria",
      rotiseria: "Rotiseria",
      supermercado: "Supermercado",
      restaurante: "Restaurante",
      cafeteria: "Cafetería",
      otro: "Otro",
    };
    return Object.entries(catMap).map(([cat, count]) => ({
      name: catNames[cat] || cat,
      value: count,
    }));
  }, [paidSales]);

  return (
    <div className="space-y-6" data-testid="business-stats">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ganaste</p>
                <p className="text-xl font-bold" data-testid="stat-total-earned">
                  ${totals.totalRevenue.toLocaleString("es-AR")}
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
                <p className="text-xl font-bold" data-testid="stat-co2-saved">
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
                <p className="text-xl font-bold" data-testid="stat-food-saved">
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
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Recuperaste vs tirar</p>
                <p className="text-xl font-bold" data-testid="stat-saved-from-waste">
                  ${totals.savedFromWaste.toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ingresos mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            {paidSales.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                Todavia no hay ventas para mostrar
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 12 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString("es-AR")}`, "Ingresos"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Impacto ambiental mensual</CardTitle>
          </CardHeader>
          <CardContent>
            {paidSales.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                Todavia no hay datos para mostrar
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 12 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v} kg`} />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      const label = name === "co2Saved" ? "CO2 evitado" : "Comida salvada";
                      return [`${value} kg`, label];
                    }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="co2Saved" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} name="co2Saved" />
                  <Bar dataKey="foodSaved" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} name="foodSaved" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {categoryData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ventas por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, "Ventas"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-green-200 dark:border-green-800">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-green-800 dark:text-green-300 mb-1">
                Tu impacto positivo
              </p>
              <p className="text-sm text-muted-foreground">
                Gracias a vos, <strong>{totals.totalFoodSaved.toFixed(1)} kg de comida</strong> no terminaron en la basura.
                Eso equivale a evitar <strong>{totals.totalCo2Saved.toFixed(1)} kg de CO2</strong> en emisiones.
                {totals.totalRevenue > 0 && (
                  <> Ademas, ganaste <strong>${totals.totalRevenue.toLocaleString("es-AR")}</strong> en vez de tirar esos productos.</>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
