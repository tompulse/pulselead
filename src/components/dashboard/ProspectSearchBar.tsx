import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";

interface ProspectSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ProspectSearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Rechercher une entreprise..." 
}: ProspectSearchBarProps) => {
  const [inputValue, setInputValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, 300);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleClear = () => {
    setInputValue("");
    onChange("");
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-accent pointer-events-none" />
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 h-12 text-base bg-card/80 backdrop-blur border-accent/30 focus:border-accent rounded-xl shadow-lg shadow-accent/5 placeholder:text-muted-foreground/60"
        />
        {inputValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 h-8 w-8 hover:bg-accent/10"
            onClick={handleClear}
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {inputValue && (
        <p className="text-xs text-muted-foreground mt-1.5 ml-1">
          Appuyez sur Entrée ou attendez pour rechercher
        </p>
      )}
    </div>
  );
};
