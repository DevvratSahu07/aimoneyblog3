import { useListTrendingPosts } from "@workspace/api-client-react";
import { PostCard } from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

export default function Trending() {
  const { data: trendingPosts, isLoading } = useListTrendingPosts({ limit: 20 });

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
          <TrendingUp className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">Trending Now</h1>
        <p className="text-lg text-muted-foreground">
          The most popular articles, case studies, and guides our community is reading right now.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full aspect-[16/10] rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : trendingPosts?.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-muted/20">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">No trending articles right now</h3>
          <p className="text-muted-foreground">Check back later as our community reads more content.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingPosts?.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}