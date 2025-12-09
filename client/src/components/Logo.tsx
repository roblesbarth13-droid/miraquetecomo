import logoImage from "@assets/Gemini_Generated_Image_q9ud4dq9ud4dq9ud_(1)_1765315558086.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className="flex items-center gap-2" data-testid="logo">
      <img
        src={logoImage}
        alt="Mirá que te como logo"
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]}`}>
          <span className="text-primary">Mirá que te</span>{" "}
          <span className="text-accent">como</span>
        </span>
      )}
    </div>
  );
}
