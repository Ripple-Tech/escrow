import { HomeBenefitItem } from "@/data/index";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

export function BenefitCard({
  benefit,
  idx,
  variant = "default", // default has bg + border
}: {
  benefit: HomeBenefitItem
  idx: number
  variant?: "default" | "plain"
}) {
  const [ref, inView] = useInView({
    threshold: 0.25,
    triggerOnce: false,
  });

  const baseClasses =
    "group relative rounded-xl p-4 md:p-5 transition-all duration-300"

  const variantClasses =
    variant === "default"
      ? "bg-white/90 backdrop-blur-sm border border-brand/20 shadow-md shadow-brand/5 hover:shadow-lg hover:shadow-brand/10"
      : "" // no bg, no border

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 80 }}
      animate={{
        opacity: inView ? 1 : 0,
        x: inView ? 0 : -80,
      }}
      transition={{
        duration: 0.6,
        delay: idx * 0.08,
        ease: "easeOut",
      }}
      className={`${baseClasses} ${variantClasses}`}
    >
      {/* Icon */}
      <div className="mb-3 flex justify-center">
        <div className="p-3 bg-brand/10 rounded-xl text-brand-accent">
          <benefit.icon className="w-10 h-10 md:w-12 md:h-12" />
        </div>
      </div>

      {/* Content */}
      <div className="text-center">
        <h3 className="text-lg md:text-xl font-bold text-brand-secondary mb-2 group-hover:text-brand transition-colors duration-300">
          {benefit.title}
        </h3>
        <p className="text-gray-700 leading-relaxed text-sm">
          {benefit.subtitle}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-4 flex justify-center">
        <a
          href={benefit.href}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-brand text-brand text-sm hover:bg-brand hover:text-white transition-colors duration-200"
          aria-label={`Learn more about ${benefit.title}`}
        >
          Learn more
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M7 4l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </motion.div>
  )
}
