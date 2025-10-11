"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

// --- FAQ Data ---
const faqs = [
  {
    question: "How does Kyve Escrow work?",
    answer: `
Kyve Escrow ensures safe transactions between buyers and sellers. When an escrow is created, one party (buyer or seller) defines the product and the agreed amount.

Once the receiving party **accepts** the escrow:
- If they are the **buyer**, the agreed amount is **locked securely** from their Kyve account.
- The transaction enters **IN PROGRESS** status until the seller delivers the product or service.
After the buyer confirms delivery, funds are **released automatically** to the seller.`,
  },
  {
    question: "Who becomes the buyer or seller in an escrow?",
    answer: `
If the **seller creates** the escrow, the person who accepts it automatically becomes the **buyer**.

If the **buyer creates** the escrow, the person who accepts becomes the **seller**.

Kyve automatically assigns these roles when the escrow is accepted.`,
  },
  {
    question: "How are funds locked and released?",
    answer: `
When a **buyer** accepts an escrow, Kyve deducts the escrow amount from their account and locks it in a secure account until the transaction completes.

Once the **seller marks the item as delivered** and the buyer confirms it by pressing **Release Funds**, Kyve immediately transfers the funds (minus escrow fees) to the seller’s wallet.`,
  },
  {
    question: "What happens when the seller marks the product as delivered?",
    answer: `
When the **seller** clicks **Mark as Delivered**, the escrow's delivery status changes to **DELIVERED**.

At that stage, only the **buyer** can release funds using the **Release Funds** button.
This final confirmation ensures buyers only release funds after receiving the product or service as agreed.`,
  },
  {
    question: "Can I cancel or decline an escrow?",
    answer: `
Yes. If you receive an escrow invitation that you don’t wish to proceed with, you can simply click **Decline**.

If you've already created the escrow and it is still **PENDING**, you can delete it.

If an escrow is declined, the buyer’s locked funds are **automatically refunded** to their wallet.`,
  },
  {
    question: "What fees does Kyve charge?",
    answer: `
Kyve applies a small escrow fee of **3%**, with a minimum of ₦500 and a maximum of ₦5000 per transaction.
This fee is automatically deducted before funds are released to the seller.`,
  },
  {
    question: "What if there’s a delivery or payment dispute?",
    answer: `
If there’s an issue with delivery or product quality, either party can open a dispute before the buyer releases funds.
Our resolution team reviews evidence from both parties to ensure a fair outcome.`,
  },
  {
    question: "How quickly are released funds credited to the seller?",
    answer: `
Once the buyer presses **Release Funds**, Kyve instantly credits the seller’s wallet balance.
The transaction will appear in the seller’s transaction history immediately.`,
  },
];

// --- Helper to convert **bold** text to <strong> elements ---
const renderFormattedText = (text: string) => {
  // Split text into parts: normal text and bold sections
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Preserve line breaks and spacing
    return <span key={i}>{part}</span>;
  });
};

function FAQItem({
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
}) {
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
      {/* Left highlight bar */}
      <span
        className={[
          "absolute left-0 top-0 h-full w-1 rounded-r",
          "bg-amber-700/0 transition-all duration-300",
          isOpen ? "bg-amber-700" : "group-hover:bg-amber-700/60",
        ].join(" ")}
        aria-hidden="true"
      />

      {/* FAQ Header */}
      <button
        onClick={() => onToggle(index)}
        aria-expanded={isOpen}
        aria-controls={`faq-${index}`}
        className="w-full flex items-center justify-between gap-4 px-5 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <span className="text-slate-900 font-semibold text-base md:text-lg">
          {question}
        </span>
        <span
          className={[
            "inline-flex h-9 w-9 items-center justify-center rounded-full border",
            "border-slate-200 bg-amber-600 text-slate-700 shadow-sm transition-all duration-300",
            isOpen ? "rotate-180 shadow" : "rotate-0",
            "group-hover:border-slate-300 group-hover:bg-slate-50",
          ].join(" ")}
        >
          <ChevronDown className="h-5 w-5" />
        </span>
      </button>

      {/* Answer Section */}
      <div
        id={`faq-${index}`}
        style={{
          maxHeight: isOpen ? contentRef.current?.scrollHeight : 0,
          transition: "max-height 350ms cubic-bezier(0.22, 1, 0.36, 1)",
          overflow: "hidden",
        }}
      >
        <div ref={contentRef} className="px-5 pb-5 text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
          {renderFormattedText(answer)}
        </div>
      </div>
    </div>
  );
}

export const EscrowFAQSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const toggle = (index: number) =>
    setActiveIndex(index === activeIndex ? null : index);

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-slate-600">
          Learn how Kyve Escrow keeps your transactions safe and transparent.
        </p>
      </div>

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