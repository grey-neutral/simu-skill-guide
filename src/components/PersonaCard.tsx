import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PersonaCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  style: string;
  difficulty: "Easy" | "Medium" | "Hard";
  isSelected: boolean;
  onClick: () => void;
}

export function PersonaCard({ name, description, image, style, difficulty, isSelected, onClick }: PersonaCardProps) {
  const difficultyColors = {
    Easy: "bg-green-100 text-green-800 border-green-200",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-200", 
    Hard: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
        isSelected 
          ? "ring-2 ring-primary border-primary shadow-professional" 
          : "hover:border-primary/50"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={image}
              alt={name}
              className="w-16 h-16 rounded-full object-cover border-2 border-border"
            />
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground truncate">{name}</h3>
              <Badge 
                variant="outline" 
                className={`text-xs ${difficultyColors[difficulty]}`}
              >
                {difficulty}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {description}
            </p>
            
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Style:</span> {style}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}