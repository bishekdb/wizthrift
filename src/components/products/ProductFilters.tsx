import { categories, sizes, conditions } from '@/data/products';

interface ProductFiltersProps {
  selectedCategory: string;
  selectedSize: string;
  selectedCondition: string;
  priceRange: [number, number];
  onCategoryChange: (category: string) => void;
  onSizeChange: (size: string) => void;
  onConditionChange: (condition: string) => void;
  onPriceChange: (range: [number, number]) => void;
}

export function ProductFilters({
  selectedCategory,
  selectedSize,
  selectedCondition,
  priceRange,
  onCategoryChange,
  onSizeChange,
  onConditionChange,
  onPriceChange,
}: ProductFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h4 className="text-micro uppercase tracking-wider text-muted-foreground mb-3">
          Category
        </h4>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category === 'All' ? '' : category)}
              className={`px-3 py-1.5 text-micro border transition-colors ${
                (category === 'All' && !selectedCategory) || selectedCategory === category
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-foreground border-border hover:border-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <h4 className="text-micro uppercase tracking-wider text-muted-foreground mb-3">
          Size
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSizeChange('')}
            className={`px-3 py-1.5 text-micro border transition-colors ${
              !selectedSize
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-foreground border-border hover:border-foreground'
            }`}
          >
            All
          </button>
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => onSizeChange(size)}
              className={`px-3 py-1.5 text-micro border transition-colors ${
                selectedSize === size
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-foreground border-border hover:border-foreground'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <h4 className="text-micro uppercase tracking-wider text-muted-foreground mb-3">
          Condition
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onConditionChange('')}
            className={`px-3 py-1.5 text-micro border transition-colors ${
              !selectedCondition
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-foreground border-border hover:border-foreground'
            }`}
          >
            All
          </button>
          {conditions.map((condition) => (
            <button
              key={condition.value}
              onClick={() => onConditionChange(condition.value)}
              className={`px-3 py-1.5 text-micro border transition-colors ${
                selectedCondition === condition.value
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-foreground border-border hover:border-foreground'
              }`}
            >
              {condition.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-micro uppercase tracking-wider text-muted-foreground mb-3">
          Price Range
        </h4>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={priceRange[0]}
            onChange={(e) => onPriceChange([Number(e.target.value), priceRange[1]])}
            placeholder="Min"
            className="w-24 px-3 py-1.5 text-micro border border-border bg-background focus:outline-none focus:border-foreground"
          />
          <span className="text-muted-foreground">—</span>
          <input
            type="number"
            value={priceRange[1]}
            onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
            placeholder="Max"
            className="w-24 px-3 py-1.5 text-micro border border-border bg-background focus:outline-none focus:border-foreground"
          />
        </div>
      </div>
    </div>
  );
}
