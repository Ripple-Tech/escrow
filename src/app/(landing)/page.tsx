import Features from "@/components/marketing/Features";
import Hero from "@/components/Hero";
import Testimonial from "@/components/marketing/Testimonial";
import StatsGrid from "@/components/marketing/StatsGrid";
import { Work } from "@/components/marketing/Work";

export default function Home() {
  return (
    <div>
      <Hero />
      <StatsGrid/>
      <Work/>
      <Features/>
      <Testimonial/>
    </div>
  );
}
