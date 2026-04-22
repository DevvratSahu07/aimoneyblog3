import { Resource } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface ResourceCardProps {
  resource: Resource;
  index?: number;
}

export function ResourceCard({ resource, index = 0 }: ResourceCardProps) {
  const pricingColor = {
    free: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    freemium: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    paid: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  }[resource.pricing];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="h-full"
    >
      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block h-full group">
        <Card className="h-full hover-elevate border-border/50 hover:border-primary/30 transition-all duration-300">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {resource.logo ? (
                  <img src={resource.logo} alt={resource.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-muted-foreground">{resource.title.charAt(0)}</span>
                )}
              </div>
              <Badge variant="secondary" className={`${pricingColor} border-none`}>
                {resource.pricing}
              </Badge>
            </div>
            
            <div className="mb-2">
              <span className="text-xs font-medium text-primary mb-1 block">{resource.category}</span>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                {resource.title}
                <ExternalLink className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground flex-1 mb-4 line-clamp-2">
              {resource.description}
            </p>
            
            <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-border/50">
              {resource.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
                  #{tag}
                </span>
              ))}
              {resource.tags.length > 3 && (
                <span className="text-xs text-muted-foreground px-1 py-0.5">
                  +{resource.tags.length - 3}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </a>
    </motion.div>
  );
}