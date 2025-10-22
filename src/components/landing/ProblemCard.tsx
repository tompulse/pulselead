import { LucideIcon } from "lucide-react";

interface ProblemCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isVisible: boolean;
  delay: string;
  animationClass: string;
}

export const ProblemCard = ({ 
  icon: Icon, 
  title, 
  description, 
  isVisible,
  delay,
  animationClass
}: ProblemCardProps) => {
  return (
    <div 
      className={`glass-card p-7 space-y-4 border-destructive/30 hover:border-destructive/50 hover:bg-destructive/5 transition-all duration-500 group ${
        isVisible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${animationClass}`
      }`} 
      style={{ transitionDelay: isVisible ? delay : '0ms' }}
    >
      <div className="w-16 h-16 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-destructive/10">
        <Icon className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
};
