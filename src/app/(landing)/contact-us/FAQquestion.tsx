"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does Kyve Escrow work?",
    answer:
      "Kyve securely holds funds in escrow until both the buyer and seller meet the agreed terms. Once the buyer confirms delivery or completion, payment is automatically released to the seller.",
  },
  {
    question: "Is Kyve Escrow safe for online transactions?",
    answer:
      "Yes. Kyve is designed to protect both parties. Funds are held in a secure escrow account until all conditions are met, reducing the risk of fraud or non-delivery.",
  },
  {
    question: "Do I need an account to create an escrow?",
    answer:
      "Regular sellers can create escrows directly through Kyve once registered, while developers or business owners who want to use Kyve Payments in their own platforms will need to integrate using an API key. Our kyve payment documentation provides clear guidance for connecting your app or website securely.",
  },
  {
    question: "When will I receive my funds?",
    answer:
      "Once the buyer confirms that the product or service has been received as agreed, Kyve releases the funds to the seller immediately. If a dispute arises, our resolution team steps in to verify and resolve the issue fairly.",
  },
  {
    question: "Can I cancel or dispute a transaction?",
    answer:
      "Yes. If there is an issue with delivery or terms, either party can open a dispute. Kyve’s dispute resolution system reviews evidence from both sides to ensure a fair outcome.",
  },
];

const FAQItem = ({
  index,
  question,
  answer,
  isOpen,
  onToggle,
}: {
  index: number;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: (index: number) => void;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-2xl border",
        "border-slate-200 bg-white/70 backdrop-blur-sm",
        "shadow-[0_10px_25px_-12px_rgba(2,6,23,0.12)]",
        "transition-all duration-300 hover:shadow-[0_18px_40px_-20px_rgba(2,6,23,0.25)]",
      ].join(" ")}
    >
      {/* Accent bar on left when open/hover */}
      <span
        className={[
          "absolute left-0 top-0 h-full w-1 rounded-r",
          "bg-amber-700/0 transition-all duration-300",
          isOpen ? "bg-amber-700" : "group-hover:bg-amber-700/60",
        ].join(" ")}
        aria-hidden="true"
      />

      {/* Trigger */}
      <button
        onClick={() => onToggle(index)}
        aria-expanded={isOpen}
        aria-controls={`faq-content-${index}`}
        className={[
          "w-full relative flex items-center justify-between gap-4",
          "px-5 py-5 text-left",
          "transition-colors duration-300",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        ].join(" ")}
      >
        <span
          className={[
            "text-slate-900 font-semibold",
            "text-base md:text-lg",
          ].join(" ")}
        >
          {question}
        </span>

        {/* Chevron trigger visual */}
        <span
          className={[
            "inline-flex h-9 w-9 items-center justify-center rounded-full",
            "border border-slate-200 bg-amber-600 text-slate-700",
            "shadow-sm transition-all duration-300",
            isOpen ? "rotate-180 shadow" : "rotate-0",
            "group-hover:border-slate-300 group-hover:bg-slate-50",
          ].join(" ")}
        >
          <ChevronDown className="h-5 w-5" />
        </span>
      </button>

      {/* Content container with animated height */}
      <div
        id={`faq-content-${index}`}
        role="region"
        aria-hidden={!isOpen}
        className="px-5 pt-0"
        style={{
          maxHeight: isOpen ? contentRef.current?.scrollHeight : 0,
          transition: "max-height 350ms cubic-bezier(0.22, 1, 0.36, 1)",
          overflow: "hidden",
        }}
      >
        <div
          ref={contentRef}
          className={[
            "pb-5 text-sm md:text-base leading-relaxed",
            "text-slate-600",
          ].join(" ")}
        >
          {answer}
        </div>
      </div>

      {/* Subtle divider glow when open */}
      <div
        className={[
          "pointer-events-none mx-5 h-px",
          "bg-gradient-to-r from-transparent via-amber-700/30 to-transparent",
          "transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </div>
  );
};

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <section className="mx-auto max-w-4xl px-6 py-8 md:py-12 bg-white">
      {/* Heading */}
      <div className="mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-slate-600">
          Everything you need to know about using Kyve securely and confidently.
        </p>
      </div>

      {/* Container */}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            index={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={activeIndex === index}
            onToggle={toggle}
          />
        ))}
      </div>
    </section>
  );
};

export default FAQSection;