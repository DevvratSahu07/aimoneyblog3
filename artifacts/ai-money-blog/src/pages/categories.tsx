import { useListCategories } from "@workspace/api-client-react";
import { CategoryCard } from "@/components/CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Folder } from "lucide-react";

export default function Categories() {
  const { data: categories, isLoading } = useListCategories();

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Folder className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">Browse Topics</h1>
        <p className="text-lg text-muted-foreground">
          Explore our curated collections of articles, guides, and case studies by category.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : categories?.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No categories found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((category, i) => (
            <CategoryCard key={category.id} category={category} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}