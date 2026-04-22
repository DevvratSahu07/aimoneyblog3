import { useParams } from "wouter";
import { 
  useGetCategory, 
  getGetCategoryQueryKey, 
  useListPosts, 
  ListPostsParams
} from "@workspace/api-client-react";
import { useState } from "react";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Folder, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  
  const [params, setParams] = useState<ListPostsParams>({
    category: slug,
    limit: 12,
    offset: 0,
    sort: "recent"
  });

  const { data: category, isLoading: loadingCategory, error: categoryError } = useGetCategory(slug || "", {
    query: {
      enabled: !!slug,
      queryKey: getGetCategoryQueryKey(slug || "")
    }
  });

  const { data: postList, isLoading: loadingPosts } = useListPosts(params, {
    query: {
      enabled: !!slug
    }
  });

  if (loadingCategory) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="mb-12 text-center max-w-2xl mx-auto space-y-4">
          <Skeleton className="w-16 h-16 rounded-2xl mx-auto" />
          <Skeleton className="h-10 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-full mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full aspect-[16/10] rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (categoryError || !category) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
        <p className="text-muted-foreground mb-8">We couldn't find the category you're looking for.</p>
        <Link href="/categories">
          <Button><ChevronLeft className="w-4 h-4 mr-2" /> Back to Categories</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          style={{ backgroundColor: category.color, color: 'white' }}
        >
          <Folder className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">{category.name}</h1>
        <p className="text-lg text-muted-foreground">
          {category.description}
        </p>
        <div className="mt-6 text-sm font-medium px-4 py-1.5 bg-muted rounded-full inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
          {category.postCount} Articles in this category
        </div>
      </div>

      {loadingPosts ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full aspect-[16/10] rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : postList?.items.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-muted/20">
          <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">No articles yet</h3>
          <p className="text-muted-foreground mb-6">Check back later for new content in this category.</p>
          <Link href="/blog">
            <Button variant="outline">Explore other articles</Button>
          </Link>
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
            <div className="flex items-center justify-between pt-8 mt-8 border-t">
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
  );
}