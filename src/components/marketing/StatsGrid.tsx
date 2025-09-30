"use client";

import React, { useEffect, useMemo } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { useInView } from "react-intersection-observer";

// Helper for large screen behavior (lg: 1024px+)
const useIsLargeScreen = () => {
  const [isLg, setIsLg] = React.useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLg(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return isLg;
};

// CountUp hook using framer-motion
function useCountUp(
  target: number,
  inView: boolean,
  opts?: { duration?: number; delay?: number }
) {
  const { duration = 1.6, delay = 0 } = opts || {};
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.floor(v));

  useEffect(() => {
    let controls: ReturnType<typeof animate> | undefined;

    if (inView) {
      controls = animate(motionVal, target, {
        duration,
        delay,
        ease: "easeOut",
      });
    } else {
      // reset when leaving view for small/medium screens
      controls = animate(motionVal, 0, { duration: 0.3, ease: "easeIn" });
    }
    return () => controls?.stop();
  }, [inView, target, duration, delay, motionVal]);

  return rounded;
}

type Stat = {
  label: string;
  value: number;
  suffix?: string;
  ariaLabel?: string;
};

const STATS: Stat[] = [
  {
    label: "Monthly Users",
    value: 500_000,
    suffix: "+",
    ariaLabel: "Five hundred thousand monthly users",
  },
  { label: "Deals", value: 107_000, ariaLabel: "One hundred and seven deals" },
  {
    label: "Registered Business",
    value: 272,
    ariaLabel: "Two hundred and seventy two registered business",
  },
  {
    label: "Approval Review",
    value: 306,
    ariaLabel: "Three hundred and six approval review",
  },
];

// Formats a MotionValue<number> reactively
const AnimatedFormattedValue: React.FC<{
  value: any;
  formatter: Intl.NumberFormat;
}> = ({ value, formatter }) => {
  const [display, setDisplay] = React.useState("0");
  useEffect(() => {
    const unsubscribe = value.on("change", (v: number) => {
      setDisplay(formatter.format(Math.max(0, Math.floor(v))));
    });
    return () => unsubscribe();
  }, [value, formatter]);
  return <span className="tabular-nums">{display}</span>;
};

// Single stat card
const StatCard: React.FC<{
  stat: Stat;
  idx: number;
  shouldCount: boolean;
  formatter: Intl.NumberFormat;
}> = ({ stat, idx, shouldCount, formatter }) => {
  const valueNode = useCountUp(stat.value, shouldCount, {
    duration: 1.2 + idx * 0.15,
    delay: 0.05 * idx,
  });

  return (
    <div
      key={stat.label}
      className={[
        "group relative p-8 md:p-10",
        "border-t border-amber-200/30",
        idx % 2 === 1 ? "sm:border-l sm:border-amber-200/30" : "",
        idx >= 2 ? "lg:border-t lg:border-amber-200/30" : "",
        idx % 4 !== 0 ? "lg:border-l lg:border-amber-200/30" : "",
      ].join(" ")}
    >
      {/* Ambient corner accent */}
      <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute -top-8 -left-8 h-24 w-24 rounded-full blur-2xl bg-amber-500/20"></div>
        <div className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full blur-3xl bg-amber-400/20"></div>
      </div>

      {/* Value */}
      <div className="flex items-end gap-2">
        <motion.span
          aria-label={stat.ariaLabel ?? stat.label}
          className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 drop-shadow"
        >
          <motion.span>{valueNode as unknown as number}</motion.span>
        </motion.span>
        {stat.suffix && (
          <span className="text-amber-600 text-2xl md:text-3xl font-bold translate-y-0.5">
            {stat.suffix}
          </span>
        )}
      </div>

      {/* Formatted shadowed number */}
      <div className="mt-1 text-amber-700/80 text-sm md:text-base font-medium">
        <AnimatedFormattedValue value={valueNode} formatter={formatter} />
      </div>

      {/* Label */}
      <div className="mt-3 text-sm uppercase tracking-widest text-gray-600">
        {stat.label}
      </div>

      {/* Accent underline */}
      <div className="mt-4 h-px w-12 bg-gradient-to-r from-amber-500/70 via-amber-400 to-transparent group-hover:w-16 transition-all duration-300"></div>
    </div>
  );
};

export const StatsGrid: React.FC = () => {
  const isLg = useIsLargeScreen();
  const controls = useAnimation();

  const { ref, inView } = useInView({
    threshold: 0.25,
    triggerOnce: false,
    rootMargin: "0px 0px -10% 0px",
  });

  useEffect(() => {
    if (isLg) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
      });
    } else {
      if (inView) {
        controls.start({
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: "easeOut" },
        });
      } else {
        controls.start({
          opacity: 0,
          y: 10,
          transition: { duration: 0.35, ease: "easeIn" },
        });
      }
    }
  }, [controls, inView, isLg]);

  const shouldCount = isLg ? true : inView;

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        notation: "compact",
        maximumFractionDigits: 1,
      }),
    []
  );

  return (
    <section className="relative w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] px-6 md:px-10 lg:px-16 py-16">
      {/* Light amber background gradient for white theme */}
      <div className="absolute inset-0 bg-[radial-gradient(75%_75%_at_center_center,rgba(251,191,36,0.08)_8%,rgba(245,158,11,0.06)_68%,transparent_100%)]"></div>
      
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={controls}
        className="mx-auto max-w-6xl"
      >
        <div className="bg-primary-glass rounded-2xl border border-amber-300/50 shadow-[0_8px_30px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/20 overflow-hidden">
          <div className="h-1 w-full divider-primary"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, idx) => (
              <StatCard
                key={stat.label}
                stat={stat}
                idx={idx}
                shouldCount={shouldCount}
                formatter={formatter}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default StatsGrid;