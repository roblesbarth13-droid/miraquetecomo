import logoImage from "@assets/Gemini_Generated_Image_q9ud4dq9ud4dq9ud_(1)_1765315558086.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  showFlag?: boolean;
}

function ArgentinaFlag({ className = "" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 30 20" 
      className={className}
      aria-label="Bandera Argentina"
    >
      <rect width="30" height="20" fill="#74ACDF" />
      <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
      <circle cx="15" cy="10" r="2.5" fill="#F6B40E" />
      <g fill="#F6B40E" transform="translate(15,10)">
        {[...Array(16)].map((_, i) => (
          <line
            key={i}
            x1="0"
            y1="0"
            x2="0"
            y2="-4"
            stroke="#F6B40E"
            strokeWidth="0.4"
            transform={`rotate(${i * 22.5})`}
          />
        ))}
      </g>
    </svg>
  );
}

export function Logo({ size = "md", showText = true, showFlag = false }: LogoProps) {
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-20 w-20",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  const flagSizeClasses = {
    sm: "w-5 h-3.5",
    md: "w-6 h-4",
    lg: "w-8 h-5",
  };

  return (
    <div className="flex items-center gap-2" data-testid="logo">
      <div className="relative">
        <img
          src={logoImage}
          alt="Mirá que te como logo"
          className={`${sizeClasses[size]} object-contain`}
        />
        {showFlag && (
          <div className="absolute -bottom-0.5 -right-1 rotate-12">
            <ArgentinaFlag className={`${flagSizeClasses[size]} drop-shadow-sm`} />
          </div>
        )}
      </div>
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]}`}>
          <span className="text-primary">Mirá que te</span>{" "}
          <span className="text-accent">como</span>
        </span>
      )}
    </div>
  );
}
