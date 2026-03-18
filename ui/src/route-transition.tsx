import * as React from "react";
import { cn } from "./utils";

/* ─────────────────────────────────────────────
 *  RouteTransition — Loading bar + fade between pages
 *
 *  Plug into Next.js Pages Router via _app.page.tsx:
 *
 *    import { RouteTransition } from "@ctox/ui/route-transition";
 *
 *    export default function App({ Component, pageProps }: AppProps) {
 *      return (
 *        <>
 *          <RouteTransition />
 *          <Component {...pageProps} />
 *        </>
 *      );
 *    }
 * ───────────────────────────────────────────── */

// ── Context ──

interface RouteTransitionState {
  isTransitioning: boolean;
  progress: number;
}

const RouteTransitionContext = React.createContext<RouteTransitionState>({
  isTransitioning: false,
  progress: 0,
});

export const useRouteTransition = () => React.useContext(RouteTransitionContext);

// ── Progress Bar ──

interface ProgressBarProps {
  progress: number;
  isVisible: boolean;
  className?: string;
  color?: string;
}

const ProgressBar = ({
  progress,
  isVisible,
  className,
  color,
}: ProgressBarProps) => {
  return (
    <div
      className={cn(
        "pointer-events-none fixed left-0 right-0 top-0 z-[99999] h-[3px] transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-r-full transition-[width] duration-300 ease-out",
          color ?? "bg-sidebar-accent",
        )}
        style={{ width: `${progress}%` }}
      />
      {/* Glow effect */}
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-24 -translate-y-px rotate-3 opacity-50",
          color ?? "bg-sidebar-accent",
        )}
        style={{
          display: progress > 0 && progress < 100 ? "block" : "none",
          boxShadow: "0 0 10px currentColor, 0 0 5px currentColor",
        }}
      />
    </div>
  );
};

// ── Fade Overlay ──

interface FadeOverlayProps {
  isVisible: boolean;
  className?: string;
}

const FadeOverlay = ({ isVisible, className }: FadeOverlayProps) => {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-[99998] bg-app-bg transition-opacity duration-200",
        isVisible ? "opacity-40" : "opacity-0",
        className,
      )}
    />
  );
};

// ── Main Component ──

interface RouteTransitionProps {
  /** Color class for the progress bar (default: bg-sidebar-accent) */
  color?: string;
  /** Show a subtle overlay during transition (default: true) */
  showOverlay?: boolean;
  /** Additional class for the progress bar container */
  className?: string;
  /** Minimum display time in ms to avoid flash (default: 300) */
  minDisplayTime?: number;
}

/**
 * RouteTransition — Drop-in page transition indicator for Next.js Pages Router.
 *
 * Features:
 * - Animated progress bar at the top of the viewport
 * - Optional fade overlay during navigation
 * - Automatic route change detection
 * - Minimum display time to prevent flash
 * - Context hook for custom loading states
 */
export const RouteTransition = ({
  color,
  showOverlay = true,
  className,
  minDisplayTime = 300,
}: RouteTransitionProps) => {
  const [state, setState] = React.useState<RouteTransitionState>({
    isTransitioning: false,
    progress: 0,
  });

  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = React.useRef<number>(0);

  const startTransition = React.useCallback(() => {
    startTimeRef.current = Date.now();

    setState({ isTransitioning: true, progress: 0 });

    // Simulate progress: fast start, slow finish
    let progress = 0;
    timerRef.current = setInterval(() => {
      progress += Math.random() * 12 + 3;
      if (progress >= 90) {
        progress = 90;
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setState((prev) => ({ ...prev, progress }));
    }, 150);
  }, []);

  const completeTransition = React.useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, minDisplayTime - elapsed);

    // Jump to 100% then fade out
    setState({ isTransitioning: true, progress: 100 });

    setTimeout(() => {
      setState({ isTransitioning: false, progress: 0 });
    }, remaining + 200);
  }, [minDisplayTime]);

  // Listen to Next.js router events
  React.useEffect(() => {
    // Dynamic import to avoid SSR issues — router events are client-only
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Router = require("next/router").default;

    const handleStart = (url: string) => {
      // Don't trigger for hash-only changes
      if (url === Router.asPath) return;
      startTransition();
    };

    const handleComplete = () => {
      completeTransition();
    };

    const handleError = () => {
      completeTransition();
    };

    Router.events.on("routeChangeStart", handleStart);
    Router.events.on("routeChangeComplete", handleComplete);
    Router.events.on("routeChangeError", handleError);

    return () => {
      Router.events.off("routeChangeStart", handleStart);
      Router.events.off("routeChangeComplete", handleComplete);
      Router.events.off("routeChangeError", handleError);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTransition, completeTransition]);

  return (
    <RouteTransitionContext.Provider value={state}>
      <ProgressBar
        className={className}
        color={color}
        isVisible={state.isTransitioning}
        progress={state.progress}
      />
      {showOverlay ? <FadeOverlay isVisible={state.isTransitioning} /> : null}
    </RouteTransitionContext.Provider>
  );
};

// ── Page Wrapper (optional) ──

interface PageFadeInProps {
  children: React.ReactNode;
  className?: string;
  /** Duration in ms (default: 200) */
  duration?: number;
}

/**
 * PageFadeIn — Wraps page content with a fade-in animation.
 *
 * Use inside your page components for a smooth entrance:
 *
 *   import { PageFadeIn } from "@ctox/ui/route-transition";
 *
 *   export default function DashboardPage() {
 *     return (
 *       <PageFadeIn>
 *         <h1>Dashboard</h1>
 *       </PageFadeIn>
 *     );
 *   }
 */
export const PageFadeIn = ({
  children,
  className,
  duration = 200,
}: PageFadeInProps) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Small delay to ensure the transition triggers
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={cn(
        "transition-all ease-out",
        mounted ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
        className,
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};
