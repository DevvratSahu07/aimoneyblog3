import { useState } from "react";
import { useListPosts, useListCategories, useListPopularTags, ListPostsParams, ListPostsSort, ListPostsDifficulty, ListPostsIncomeType } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, SlidersHorizontal, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Blog() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialSearch = searchParams.get("search") || "";
  const initialTag = searchParams.get("tag") || "";
  const initialCategory = searchParams.get("category") || "";

  const [params, setParams] = useState<ListPostsParams>({
    limit: 12,
    offset: 0,
    sort: "recent",
    search: initialSearch,
    tag: initialTag,
    category: initialCategory,
  });

  const [showFilters, setShowFilters] = useState(false);

  const { data: postList, isLoading: loadingPosts } = useListPosts(params);
  const { data: categories } = useListCategories();
  const { data: popularTags } = useListPopularTags({ limit: 10 });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setParams((p) => ({ ...p, search: formData.get("search") as string, offset: 0 }));
  };

  const clearFilters = () => {
    setParams({
      limit: 12,
      offset: 0,
      sort: "recent",
    });
  };

  const hasFilters = Boolean(params.search || params.tag || params.category || params.difficulty || params.incomeType || params.premium);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">All Articles</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Deep dives, case studies, and actionable guides to help you monetize AI.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className={`lg:w-64 shrink-0 space-y-8 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </h3>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs text-muted-foreground">
                  Clear
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={params.category || "all"} onValueChange={(v) => setParams({ ...params, category: v === "all" ? undefined : v, offset: 0 })}>
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
                <label className="text-sm font-medium">Difficulty</label>
                <Select value={params.difficulty || "all"} onValueChange={(v) => setParams({ ...params, difficulty: v === "all" ? undefined : v as ListPostsDifficulty, offset: 0 })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Income Type</label>
                <Select value={params.incomeType || "all"} onValueChange={(v) => setParams({ ...params, incomeType: v === "all" ? undefined : v as ListPostsIncomeType, offset: 0 })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="passive">Passive</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Access</label>
                <Select value={params.premium === undefined ? "all" : params.premium ? "premium" : "free"} onValueChange={(v) => setParams({ ...params, premium: v === "all" ? undefined : v === "premium", offset: 0 })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Access</SelectItem>
                    <SelectItem value="free">Free Only</SelectItem>
                    <SelectItem value="premium">Premium Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags?.map((tag) => (
                <button
                  key={tag.tag}
                  onClick={() => setParams({ ...params, tag: params.tag === tag.tag ? undefined : tag.tag, offset: 0 })}
                  className={`text-xs px-2.5 py-1 rounded-full transition-colors border ${
                    params.tag === tag.tag 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background hover:border-primary'
                  }`}
                >
                  #{tag.tag}
                </button>
              ))}
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
                placeholder="Search articles..."
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
                    setParams(p => ({ ...p, search: undefined, offset: 0 }));
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>

            <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <Button 
                variant="outline" 
                className="lg:hidden flex-1 sm:flex-none"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
              </Button>
              
              <Select value={params.sort || "recent"} onValueChange={(v) => setParams({ ...params, sort: v as ListPostsSort })}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border/50">
              <span className="font-medium mr-2 text-foreground">Active:</span>
              {params.search && <Badge variant="secondary" className="gap-1 flex items-center">Search: {params.search} <X className="w-3 h-3 cursor-pointer hover:text-foreground ml-1" onClick={() => setParams(p => ({...p, search: undefined, offset: 0}))} /></Badge>}
              {params.category && <Badge variant="secondary" className="gap-1 flex items-center">Category: {categories?.find(c => c.slug === params.category)?.name || params.category} <X className="w-3 h-3 cursor-pointer hover:text-foreground ml-1" onClick={() => setParams(p => ({...p, category: undefined, offset: 0}))} /></Badge>}
              {params.tag && <Badge variant="secondary" className="gap-1 flex items-center">Tag: #{params.tag} <X className="w-3 h-3 cursor-pointer hover:text-foreground ml-1" onClick={() => setParams(p => ({...p, tag: undefined, offset: 0}))} /></Badge>}
              {params.difficulty && <Badge variant="secondary" className="gap-1 flex items-center">Difficulty: {params.difficulty} <X className="w-3 h-3 cursor-pointer hover:text-foreground ml-1" onClick={() => setParams(p => ({...p, difficulty: undefined, offset: 0}))} /></Badge>}
              {params.incomeType && <Badge variant="secondary" className="gap-1 flex items-center">Income: {params.incomeType} <X className="w-3 h-3 cursor-pointer hover:text-foreground ml-1" onClick={() => setParams(p => ({...p, incomeType: undefined, offset: 0}))} /></Badge>}
              {params.premium !== undefined && <Badge variant="secondary" className="gap-1 flex items-center">Access: {params.premium ? 'Premium' : 'Free'} <X className="w-3 h-3 cursor-pointer hover:text-foreground ml-1" onClick={() => setParams(p => ({...p, premium: undefined, offset: 0}))} /></Badge>}
            </div>
          )}

          {loadingPosts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="w-full aspect-[16/10] rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : postList?.items.length === 0 ? (
            <div className="text-center py-20 border rounded-xl bg-muted/20">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or search query.</p>
              <Button onClick={clearFilters}>Clear all filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {postList?.items.map((post, i) => (
                  <PostCard key={post.id} post={post} index={i} />
                ))}
              </div>
              
              {/* Pagination */}
              {postList && postList.total > (params.limit || 12) && (
                <div className="flex items-center justify-between pt-8 border-t">
                  <span className="text-sm text-muted-foreground">
                    Showing {(params.offset || 0) + 1} to Math.min({((params.offset || 0) + (params.limit || 12))}, {postList.total}) of {postList.total}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={!params.offset || params.offset === 0}
                      onClick={() => setParams(p => ({ ...p, offset: Math.max(0, (p.offset || 0) - (p.limit || 12)) }))}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={((params.offset || 0) + (params.limit || 12)) >= postList.total}
                      onClick={() => setParams(p => ({ ...p, offset: (p.offset || 0) + (p.limit || 12) }))}
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}