import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function Logo({ className, onClick, ...props }: SVGProps<SVGSVGElement> & { onClick?: () => void }) {
  return (
    <div
      className={cn("flex items-center gap-2 select-none", onClick && "cursor-pointer active:scale-95 transition-transform", className)}
      aria-label="PatternSight homepage"
      onClick={onClick}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
        {...props}
      >
        <path
          d="M4 16L8 12L12 16L16 10L20 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 8L6 10L9 6L13 12L17 9L20 11"
          stroke="hsl(var(--accent))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 2"
        />
      </svg>
      <span className="font-bold text-lg font-headline">PatternSight</span>
    </div>
  );
}
