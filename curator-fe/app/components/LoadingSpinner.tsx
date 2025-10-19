interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export default function LoadingSpinner({ size = 'medium', message = 'Loading...' }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className="flex justify-center items-center min-h-64 relative">
      {/* Abstract background shapes */}
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="w-32 h-32 border border-black/5 rotate-45 absolute"></div>
        <div className="w-20 h-20 bg-black/5 rounded-full absolute animate-pulse"></div>
      </div>
      
      <div className="relative z-10">
        {/* Abstract geometric loading animation */}
        <div className="relative flex justify-center items-center">
          {/* Rotating square */}
          <div className={`animate-spin ${sizeClasses[size]} border-2 border-black border-t-transparent`}></div>
          
          {/* Inner animated shapes */}
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="w-3 h-3 bg-black animate-pulse"></div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-black text-sm font-medium">{message}</p>
          
          {/* Abstract dots animation */}
          <div className="flex justify-center items-center mt-2 space-x-1">
            <div className="w-2 h-2 bg-black animate-bounce"></div>
            <div className="w-2 h-2 bg-black animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-black animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}