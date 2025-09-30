"use client";
import { Heading } from "../heading";
import { 
  MultiCurrencyIcon, 
  KyveProtectionIcon, 
  KYCVerificationIcon, 
  SolveDisputeIcon,
  RiskReductionIcon 
} from "./featureIcon";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

export type FeatureItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const featuresData: FeatureItem[] = [
  { 
    id: "feature-1", 
    title: "Multi Currency", 
    subtitle: "Support local fiat (e.g NGN, KES, ZAR), mobile money, and stablecoins (e.g. USDT, cUSD). This feature will be later.",
    icon: MultiCurrencyIcon
  },
  { 
    id: "feature-2", 
    title: "Kyve Protection", 
    subtitle: "Funds are held securely and automatically released only when both parties confirm satisfaction.",
    icon: KyveProtectionIcon
  },
  { 
    id: "feature-3", 
    title: "KYC Verification", 
    subtitle: "KYC & Identity verification: Users can verify their identity for added trust and visibility in the marketplace.",
    icon: KYCVerificationIcon
  },
  { 
    id: "feature-4", 
    title: "Solve Dispute", 
    subtitle: "In-App Dispute Resolution: If things go wrong, kyve's dispute system helps users submit evidence, and our moderators make a fair decision.",
    icon: SolveDisputeIcon
  },
  { 
    id: "feature-5", 
    title: "Risk Reduction", 
    subtitle: "Protect yourself from fraud and ensure that both parties meet their obligations before funds are released.",
    icon: RiskReductionIcon
  },
];

function FeatureCard({ feature, idx }: { feature: FeatureItem; idx: number }) {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={{ 
        opacity: inView ? 1 : 0, 
        y: inView ? 0 : 50 
      }}
      transition={{
        duration: 0.6,
        delay: idx * 0.1,
        ease: "easeOut",
      }}
      className="group relative bg-white/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 shadow-lg shadow-primary/5 hover:shadow-primary-glow transition-all duration-300 hover:border-primary/40 hover:translate-y-[-4px]"
    >
      {/* Icon */}
      <div className="mb-6 flex justify-center">
        <div className="p-4 bg-primary/10 rounded-2xl text-amber-600 group-hover:text-amber-700 transition-colors duration-300">
          <feature.icon className="w-14 h-14 md:w-16 md:h-16" />
        </div>
      </div>

      {/* Content */}
      <div className="text-center">
        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
          {feature.subtitle}
        </p>
      </div>
    </motion.div>
  );
}

const Features: React.FC = () => {
  return (
    <section className="w-full bg-background px-10 py-16 md:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="heading-wrap relative mb-10">  
        <h2 className="heading-display">Key Features</h2>
        <p className="subheading mt-4 md:mt-6 text-foreground/80">
  Secure escrow, identity verification, and dispute resolution built to make every transaction safe and trustworthy.
</p>
        </div>

        <div className="flex flex-col gap-16">
          {/* Top row - 3 items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {featuresData.slice(0, 3).map((feature, idx) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                idx={idx}
              />
            ))}
          </div>

          {/* Bottom row - 2 items centered */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl">
              {featuresData.slice(3, 5).map((feature, idx) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  idx={idx + 3} // Continue the index for staggered animation
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;