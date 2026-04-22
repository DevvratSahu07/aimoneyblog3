import { useState } from "react";
import { useListResources, useListCategories, ListResourcesParams, ListResourcesPricing } from "@workspace/api-client-react";
import { ResourceCard } from "@/components/ResourceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Box, SlidersHorizontal, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Resources() {
  const [params, setParams] = useState<ListResourcesParams>({
    limit: 12
  });

  const [showFilters, setShowFilters] = useState(false);

  const { data: resourceList, isLoading: loadingResources } = useListResources(params);
  const { data: categories } = useListCategories();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setParams((p) => ({ ...p, search: formData.get("search") as string }));
  };

  const clearFilters = () => {
    setParams({
      limit: 12,
    });
  };

  const hasFilters = Boolean(params.search || params.category || params.pricing);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Box className="w-6 h-6" />
          </div>
          AI Tool Directory
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          A curated collection of the best AI tools, platforms, and resources to help you build and monetize faster.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className={`lg:w-64 shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filters</h3>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs text-muted-foreground">
                  Clear
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={params.category || "all"} onValueChange={(v) => setParams({ ...params, category: v === "all" ? undefined : v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pricing Model</label>
                <Select value={params.pricing || "all"} onValueChange={(v) => setParams({ ...params, pricing: v === "all" ? undefined : v as ListResourcesPricing })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Pricing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pricing</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <form onSubmit={handleSearch} className="relative w-full sm:w-auto sm:min-w-[300px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search resources..."
                className="pl-9"
                defaultValue={params.search}
              />
              {params.search && (
                <button 
                  type="button" 
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    const form = document.querySelector('form');
                    if (form) form.reset();
                    setParams(p => ({ ...p, search: undefined }));
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>

            <Button 
              variant="outline" 
              className="w-full lg:hidden sm:w-auto"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
            </Button>
          </div>

          {/* Active Filters Display */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border/50">
              <span className="font-medium mr-2 text-foreground">Active:</span>
              {params.search && <Badge variant="secondary" className="gap-1 flex items-center">Search: {params.search} <X className="w-3 h-3 cursor-pointer hover:text-foreground ml-1" onClick={() => setParams(p => ({...p, search: undefined}))} /></Badge>}
              {params.category && <Badge variant="secondary" className="gap-1 flex items-center">Category: {categories?.find(c => c.slug === params.category)?.name || params.category} <X className="w-3 h-3 cursor-pointer hover:text-foreground ml-1" onClick={() => setParams(p => ({...p, category: undefined}))} /></Badge>}
              {params.pricing && <Badge variant="secondary" className="gap-1 flex items-center">Pricing: {params.pricing} <X className="w-3 h-3 cursor-pointer hover:text-foreground ml-1" onClick={() => setParams(p => ({...p, pricing: undefined}))} /></Badge>}
            </div>
          )}

          {loadingResources ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : resourceList?.items?.length === 0 ? (
            <div className="text-center py-20 border rounded-xl bg-muted/20">
              <Box className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">No resources found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or search query.</p>
              <Button onClick={clearFilters}>Clear all filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {resourceList?.items?.map((resource, i) => (
                <ResourceCard key={resource.id} resource={resource} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}