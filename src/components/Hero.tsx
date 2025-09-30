"use client"
import Image from "next/image"
import { Star } from "lucide-react"
import { CreateEscrowModal } from "./create-escrow"
import EscrowCalculator from "./marketing/escrowCalculator"
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";

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
    <div className="bg-kyve-hero min-h-screen w-full flex flex-1  py-10 gap-10 flex-col lg:flex-row">
      <div className="flex flex-col md:flex-1 text-left px-10  mt-10">
        <h1 className="text-4xl md:text-5xl font-bold text-golden-dark">The Escrow Platform You Can <br/> Trust</h1>
        
     
   {/* Store buttons */}
        <div className="flex flex-col items-center justify-center gap-4 mt-8">
          <Image
            src="/playstore.png"
            alt="Get it on Google Play"
            width={260}
            height={100}
            className="cursor-pointer"
          />
          <Image
            src="/appstore.png"
            alt="Download on the App Store"
            width={260}
            height={100}
            className="cursor-pointer"
          />
        </div>
         <p className="font-semibold mt-4 text-center text-[15px] text-gray-800">Download Kyve App Today!</p>
     
          <div className="flex flex-auto flex-col py-5 items-center justify-center gap-6 bg-brand-25 mt-0  lg:p-16 rounded-b-[2rem] lg:rounded-bl-none lg:rounded-r-[2rem]">
                    <div className="flex gap-0.5 mb-1 justify-center lg:justify-start">
                      <Star className="size-5 text-brand-600 fill-[#fb9e08]" />
                      <Star className="size-5 text-brand-600 fill-[#fb9e08]" />
                      <Star className="size-5 text-brand-600 fill-[#fb9e08]" />
                      <Star className="size-5 text-brand-600 fill-[#fb9e08]" />
                      <Star className="size-5 text-brand-600 fill-[#fb9e08]" />
                    </div>
       </div>
      </div>
     
      <div className="relative z-10 mt-8 px-5 lg:mt-0 w-full md:basis-2/3 lg:basis-1/2 md:px-6 lg:px-10">
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