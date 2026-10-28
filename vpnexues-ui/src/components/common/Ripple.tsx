import { useCallback, type ReactNode, type MouseEvent as ReactMouseEvent } from 'react';
import styles from './css/Ripple.module.css';

type RippleVariant = 'light' | 'dark' | 'gold' | 'red';

export function useRipple(variant: RippleVariant = 'light') {
  return useCallback(
    (e: ReactMouseEvent<HTMLElement>) => {
      const el = e.currentTarget as HTMLElement;
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      const variantClass =
        variant === 'dark' ? styles.dark : variant === 'gold' ? styles.gold : variant === 'red' ? styles.red : '';
      ripple.className = `${styles.ripple} ${variantClass}`;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      // Ensure host can clip ripple
      const prevPosition = el.style.position;
      const prevOverflow = el.style.overflow;
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      el.style.overflow = 'hidden';

      el.appendChild(ripple);
      ripple.addEventListener('animationend', () => {
        ripple.remove();
        // restore if we changed it (only if still not needed)
        if (prevPosition === '') el.style.position = '';
        if (prevOverflow === '') el.style.overflow = '';
      });
    },
    [variant],
  );
}

interface RippleProps {
  children: ReactNode;
  variant?: RippleVariant;
  className?: string;
  disabled?: boolean;
  onClick?: (e: ReactMouseEvent<HTMLElement>) => void;
  style?: React.CSSProperties;
}

export default function Ripple({ children, variant = 'light', className = '', disabled = false, onClick, style }: RippleProps) {
  const createRipple = useRipple(variant);

  const handleClick = useCallback(
    (e: ReactMouseEvent<HTMLElement>) => {
      if (disabled) return;
      createRipple(e);
      onClick?.(e);
    },
    [disabled, onClick, createRipple],
  );

  return (
    <div className={`${styles.wrap} ${className}`} onClick={handleClick} style={style} role="button" tabIndex={0}>
      {children}
    </div>
  );
}
