import { Link } from "wouter";
import { Category } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Folder, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface CategoryCardProps {
  category: Category;
  index?: number;
}

export function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/categories/${category.slug}`}>
        <Card className="h-full hover-elevate border-border/50 hover:border-primary/30 transition-all duration-300 group cursor-pointer overflow-hidden relative">
          <div 
            className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 transition-transform group-hover:scale-110 duration-500" 
            style={{ backgroundColor: category.color }}
          />
          <CardContent className="p-6 flex flex-col h-full relative z-10">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white shadow-sm"
              style={{ backgroundColor: category.color }}
            >
              <Folder className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl mb-2 group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            <p className="text-muted-foreground text-sm flex-1 mb-4">
              {category.description}
            </p>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs font-medium px-2 py-1 bg-muted rounded text-muted-foreground">
                {category.postCount} {category.postCount === 1 ? 'Article' : 'Articles'}
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}