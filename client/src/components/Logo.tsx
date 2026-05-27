import logoImage from "@assets/logo-platoamigo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12 sm:h-14 sm:w-14",
    lg: "h-24 w-24",
  };

  const textSizeClasses = {
    sm: "text-base sm:text-lg",
    md: "text-sm sm:text-xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex items-center gap-2" data-testid="logo">
      <img
        src={logoImage}
        alt="Plato Amigo logo"
        className={`${sizeClasses[size]} object-contain flex-shrink-0`}
      />
      {showText && (
        <span className={`font-bold whitespace-nowrap ${textSizeClasses[size]}`}>
          <span className="text-primary">Plato</span>{" "}
          <span className="text-accent">Amigo</span>
        </span>
      )}
    </div>
  );
}

export function ArgentinaStripes() {
  return (
    <div className="flex flex-col gap-0.5 w-8" aria-label="Argentina">
      <div className="h-1.5 rounded-full" style={{ backgroundColor: "#74ACDF" }} />
      <div className="h-1.5 rounded-full bg-white border border-border/30" />
      <div className="h-1.5 rounded-full" style={{ backgroundColor: "#74ACDF" }} />
    </div>
  );
}
