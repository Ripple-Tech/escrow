export const MultiCurrencyIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="32" cy="32" r="16" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <text x="32" y="28" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="bold">NGN</text>
    <text x="32" y="38" textAnchor="middle" fill="currentColor" fontSize="8">USDT</text>
    <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.7"/>
    <circle cx="44" cy="44" r="2" fill="currentColor" opacity="0.5"/>
  </svg>
);

export const KyveProtectionIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 12L20 18V32C20 40 26 46 32 52C38 46 44 40 44 32V18L32 12Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M32 38C35.3137 38 38 35.3137 38 32C38 28.6863 35.3137 26 32 26C28.6863 26 26 28.6863 26 32C26 35.3137 28.6863 38 32 38Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M30 30L34 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M34 30L30 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const KYCVerificationIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="24" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M20 44C20 38 26 34 32 34C38 34 44 38 44 44" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M36 40L30 46L28 44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const SolveDisputeIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 20H40V36H24V20Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M28 24H36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M28 28H36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M28 32H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M20 44L24 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M44 44L40 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
  export const RiskReductionIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 24L32 16L44 24V40C44 46 38 50 32 52C26 50 20 46 20 40V24Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M26 30L30 34L38 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M28 40H36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M28 44H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);