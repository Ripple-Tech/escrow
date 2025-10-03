import { 
  MultiCurrencyIcon, 
  KyveProtectionIcon, 
  KYCVerificationIcon, 
  SolveDisputeIcon,
  RiskReductionIcon 
} from "@/components/marketing/featureIcon";

export type HomeBenefitItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
};


export const phasesData = [
  {
    id: 1,
    phase: "Phase One",
    name: "phase one",
    title: "Mutual Decision",
    subtitle: "Stage One: The buyer initiates transaction with the seller.",
    image: "/phase1.svg",
    cta: "Initiate",
  },
  {
    id: 2,
    phase: "Phase Two",
    name: "phase two",
    title: "Payment Submission",
    subtitle:
      "Stage Two: The buyer locks up funds into KYVE, as agreed with the seller.",
    image: "/phase2.svg",
    cta: "Secure Funds",
  },
  {
    id: 3,
    phase: "Phase Three",
    name: "phase three",
    title: "Product Delivery",
    subtitle:
      "Stage Three: The seller delivers the purchased goods to the buyer.",
    image: "/phase3.svg",
    cta: "Deliver",
  },
  {
    id: 4,
    phase: "Phase Four",
    name: "phase four",
    title: "Goods Received Approval",
    subtitle:
      "Stage Four: The buyer receives and acknowledges the goods sent by seller.",
    image: "/phase4.svg",
    cta: "Approve",
  },
  {
    id: 5,
    phase: "Phase Five",
    name: "phase five",
    title: "Payment Release",
    subtitle:
      "Stage Five: KYVE releases payment to the seller after confirmation from the buyer.",
    image: "/phase5.svg",
    cta: "Release",
  },
];

export const homeBenefitsData: HomeBenefitItem[] = [
  {
    id: "benefit-1",
    title: "Multi-Currency Escrow",
    subtitle:
      "At Kyve, we ensure that payments are securely held and released across multiple currencies, giving buyers and sellers confidence in global transactions.",
    icon: MultiCurrencyIcon,
    href: "/services/multi-currency-escrow",
  },
  {
    id: "benefit-2",
    title: "Protected Payments",
    subtitle:
      "We at Kyve safeguard your funds by locking them until both parties meet the agreed conditions, ensuring peace of mind for every transaction.",
    icon: KyveProtectionIcon,
    href: "/services/protected-payments",
  },
  {
    id: "benefit-3",
    title: "KYC Verification",
    subtitle:
      "We ensure that trust is built on every deal by verifying user identities through our compliance-driven KYC process.",
    icon: KYCVerificationIcon,
    href: "/services/kyc-verification",
  },
  {
    id: "benefit-4",
    title: "Dispute Resolution",
    subtitle:
      "At Kyve, we provide a fair resolution process when buyers and sellers disagree, ensuring that every outcome is impartial and transparent.",
    icon: SolveDisputeIcon,
    href: "/services/dispute-resolution",
  },
  {
    id: "benefit-5",
    title: "Risk Reduction",
    subtitle: 
      "We ensure reduced fraud and payment risks by acting as the trusted middle layer between both parties in every transaction.",
    icon: RiskReductionIcon,
    href: "/services/risk-reduction",
  },
  {
    id: "benefit-6",
    title: "Business Escrow",
    subtitle:
      "At Kyve, we provide secure escrow services for individuals and businesses, ensuring smooth and reliable transactions across industries.",
    icon: RiskReductionIcon,
    href: "/services/business-escrow",
  }
];
