import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Croissant, Carrot, Beef, ChefHat, ShoppingCart } from "lucide-react";
import { categoryDisplayNames } from "@shared/schema";

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const categories = [
  { id: "panaderia", icon: Croissant },
  { id: "verduleria", icon: Carrot },
  { id: "carniceria", icon: Beef },
  { id: "rotiseria", icon: ChefHat },
  { id: "supermercado", icon: ShoppingCart },
];

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="py-4" data-testid="category-filter">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 px-4">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            className="rounded-full px-6 py-3 flex-shrink-0"
            onClick={() => onCategoryChange(null)}
            data-testid="button-category-all"
          >
            Todas
          </Button>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isSelected ? "default" : "outline"}
                className="rounded-full px-6 py-3 flex-shrink-0"
                onClick={() => onCategoryChange(cat.id)}
                data-testid={`button-category-${cat.id}`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {categoryDisplayNames[cat.id]}
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
