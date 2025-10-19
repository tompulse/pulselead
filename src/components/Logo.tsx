import logoImage from "@/assets/logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  withGlow?: boolean;
}

export const Logo = ({ size = "md", className = "", withGlow = true }: LogoProps) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12"
  };

  return (
    <div className={`relative ${className}`}>
      {withGlow && (
        <div className="absolute inset-0 bg-accent/30 blur-lg group-hover:blur-xl transition-all duration-300"></div>
      )}
      <img 
        src={logoImage} 
        alt="LUMA Logo" 
        className={`${sizeClasses[size]} relative object-contain`}
      />
    </div>
  );
};
