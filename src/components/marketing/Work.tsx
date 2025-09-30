"use client";
import Image from "next/image";
import { phasesData } from "@/data";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

function PhaseCard({ step, idx, total }: { step: any; idx: number; total: number }) {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false, // This allows the animation to trigger again when scrolling out
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -50 }}
      animate={{ 
        opacity: inView ? 1 : 0, 
        x: inView ? 0 : 50 
      }}
      transition={{
        duration: 0.6,
        delay: idx * 0.1, // Staggered animation
        ease: "easeOut",
      }}
      className="relative overflow-hidden flex flex-col w-full max-w-sm mx-auto bg-white/80 backdrop-blur-sm border border-primary/40 rounded-2xl shadow-lg shadow-primary/5 hover:shadow-primary-glow transition-all duration-300 hover:border-amber-500 group"
    >
      <div className="relative p-5 md:p-6 lg:p-6 flex flex-col gap-4 z-10">
        {/* Top meta */}
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb)/0.6)]" />
            <span className="text-xs uppercase tracking-widest text-foreground/70 font-medium">
              {step.phase}
            </span>
          </div>

          <div className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
            {step.title}
          </div>
        </div>

        {/* Content row: image + text */}
        <div className="grid grid-cols-1 sm:grid-cols-[auto,1fr] items-center gap-5">
          {/* Image side with soft ring */}
          <div className="relative justify-self-center sm:justify-self-start">
            <div className="absolute inset-0 -m-3 rounded-xl bg-primary/5 shadow-[0_0_0_1px_rgba(var(--primary-rgb)/0.15),0_8px_32px_rgba(var(--primary-rgb)/0.1)]" />
            {/* Wider image on small screens to reduce right empty space */}
            <div className="relative w-32 h-32 sm:w-28 sm:h-28 md:w-28 md:h-28">
              <Image
                src={step.image}
                alt={step.title}
                fill
                sizes="(max-width: 640px) 128px, (max-width: 768px) 112px, 112px"
                className="object-contain"
                priority={idx === 0}
              />
            </div>
          </div>

          {/* Text side */}
          <div className="text-center sm:text-left">
            <h3 className="text-xl lg:break-words font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-primary group-hover:from-primary group-hover:to-primary/80 transition-all duration-300">
              {step.title}
            </h3>
            <p className="mt-2 text-sm md:text-base leading-relaxed break-words p-2 text-foreground/80">
              {step.subtitle}
            </p>

            {/* Progress hint */}
            <div className="mt-4 flex items-center justify-center sm:justify-start gap-2">
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i <= idx 
                      ? "bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb)/0.4)]" 
                      : "bg-foreground/20"
                  }`}
                  style={{
                    width: i === idx ? 48 : 28,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom chrome */}
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-foreground/55 font-medium">
            Step {idx + 1} of {total}
          </div>
          <div className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground shadow-[0_4px_16px_rgba(var(--primary-rgb)/0.3)] border border-primary/30 hover:shadow-[0_6px_20px_rgba(var(--primary-rgb)/0.4)] transition-all duration-200 hover:scale-105">
            {step.cta}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export const Work = () => {
  return (
    <section className="relative w-full pt-5 bg-background">
      <div className="heading-wrap relative">  
        <h2 className="heading-display">How Kyve Works</h2>
        <p className="subheading mt-4 md:mt-6 text-foreground/80">
          KYVE platform secures funds in a neutral smart escrow, verifies delivery
          or milestones, and releases payment only when terms are met, bringing
          clarity, fairness, and confidence to every transaction.
        </p>
      </div>

      {/* Grid of cards */}
      <div className="relative z-10 mx-auto mt-10 md:mt-14 w-full max-w-7xl px-4 md:px-6">
        {/* Subtle background glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-6 -inset-y-6 opacity-40"
          style={{
            background: "radial-gradient(60% 60% at 50% 40%, rgba(var(--primary-rgb) / 0.08), transparent 60%)",
          }}
        />

        {/* Flex container with wrapping */}
        <div className="py-10 flex flex-wrap justify-center gap-8">
          {phasesData.map((step, idx) => (
            <div 
              key={step.id} 
              className="w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)]"
            >
              <PhaseCard
                step={step}
                idx={idx}
                total={phasesData.length}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};