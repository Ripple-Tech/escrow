"use client"
import Image from "next/image"
import { Star } from "lucide-react"
import { CreateEscrowModal } from "./create-escrow"
import EscrowCalculator from "./marketing/escrowCalculator"
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import { ShinyButton } from "./shiny-button"

// Detect large screens (lg: 1024px+)
const useIsLargeScreen = () => {
  const [isLg, setIsLg] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLg(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return isLg;
};
const Hero = () => {
   const controls = useAnimation();
  const isLg = useIsLargeScreen();

  // Observe the calculator wrapper
  const { ref, inView } = useInView({
    threshold: 0.2,
    rootMargin: "0px 0px -10% 0px",
    triggerOnce: false,
  });

  useEffect(() => {
    const spring = { type: "spring", stiffness: 260, damping: 28 };
    if (isLg) {
      // Large screens: slide in once from left and stay
      controls.start({
        opacity: 1,
        x: 0,
        transition: spring,
      });
    } else {
      // Small/medium: slide in/out based on visibility
      if (inView) {
        controls.start({
          opacity: 1,
          x: 0,
          transition: spring,
        });
      } else {
        // Slide back out to the left
        controls.start({
          opacity: 0,
          x: -80,
          transition: { ...spring, stiffness: 220, damping: 26 },
        });
      }
    }
  }, [controls, inView, isLg]);

  return (
    <div className="bg-kyve-hero min-h-screen w-full flex flex-1  py-8 gap-10 flex-col lg:flex-row">
      <div className="flex flex-col md:flex-1 text-left px-10 gap-8  mt-10">
        <h1 className="heading-display text-center">The Escrow Platform You Can Trust</h1>
        
         <p className="font-semibold mt-4 text-center text-[20px] text-gray-800">Trade Safely, Kyve is your digital shield</p>
         
           <div className="flex items-center mt-5 justify-center">
             <ShinyButton 
                  href="/auth/register"
                  className="relative z-10 h-14 max-w-xs bg-amber-600 text-base shadow-lg transition-shadow duration-300 hover:shadow-xl"
                >
                  Explore
             </ShinyButton>
             </div>
     
      </div>

     
      <div className="relative z-10 mt-8 px-5 w-full lg:mt-30 md:basis-2/3 lg:basis-1/2 md:px-6 lg:px-10">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -80 }}  // start off-screen to the left
            animate={controls}                // controlled via useEffect
            exit={{ opacity: 0, x: -80 }}     // for route transitions if applicable
          >
        <EscrowCalculator />
        </motion.div>
      </div>
    </div>
  )
}

export default Hero