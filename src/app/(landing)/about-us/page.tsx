import { ShinyButton } from "@/components/shiny-button";
import Image from "next/image";

const page = () => {
  return (
    <>
     <div className='flex flex-col '>
           <div className="relative w-full h-[250px] md:h-[350px] lg:h-[450px] ">
                       <Image
                         src="/about-us1.png"
                         alt="Protection"
                         fill
                         className="object-cover object-center"
                         priority
                       />
                     </div>
   
    <div className='heading-wrap '>
        <a href='/' className='link-with-lines hover:underline mb-5 text-brand-secondary text-[18px] font-semibold'>Back to kyve</a>
  
    </div>

<div className="flex flex-col lg:flex-row">
    <div className='flex flex-col items-center justify-center leading-relaxed gap-10 text-base text-center md:text-xl md:px-20 lg:px-10 text-darktext px-10 mb-10 lg:w-2/3'>
         <p >
           The Kyve was born from a simple vision;
            a world where every exchange is fair and every voice is protected. Our founder believed buyers and sellers deserve the same shield of justice, the same clarity, the same peace of mind.
             We build systems that make trust practical, with safeguards that reduce risk and resolve conflicts, so people can focus on creating value rather than worrying about what could go wrong.</p>
          <p>
          Whether you are making your first purchase or closing a major deal, the Kyve platform stands beside you at each step. We provide clear agreements, protected funds, transparent milestones, 
          and a path to resolution when things do not go as planned.
           You deserve a partner that values integrity, accountability, and security. Our mission is simple. Protect both sides. Promote confidence. Make fair exchange the default everywhere.
           </p></div>

   <div className="flex flex-col lg:w-1/3">
     <div className='flex justify-center md:justify-start px-10 '>
          <ShinyButton
                   href="/services"
                   className="relative z-10 h-14 w-full max-w-xs mb-10 bg-primary text-base shadow-lg transition-shadow duration-300 hover:shadow-xl"
                 >
                   Explore our services
             </ShinyButton>
        </div>
        <div className='flex justify-center items-center  px-auto'>
          <div className='flex flex-col border items-center justify-center rounded-lg mb-10 mx-10 h-[150px] w-[300px] sm:w-[400px] border-brand-accent p-4'>
      <p className='text-2xl font-semibold text-center text-brand'>Need help right now? Call us anytime at</p>
       <a  href="tel:+234 9077144184" className="text-2xl text-center font-bold mt-3 text-brand-secondary hover:text-brand">
              + 234 9077144184 </a>
        </div>
     </div>
     </div>

 </div>

   
{/* Next.js/React TSX version using className instead of class */}

<div className="flex flex-1 md:mt-10 flex-col bg-brand-secondary lg:flex-row-reverse mb-10">
  {/* Left: Video panel (replaces founder background image) */}
  <div className="flex flex-col lg:w-1/2">
    <div className="px-6 md:px-20 mt-10 lg:px-10">
      <div className="relative mb-10 rounded-lg overflow-hidden bg-amber-900">
        {/* Gradient overlay for readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 to-black/40" />

        {/* Responsive video */}
        <div className="w-full aspect-video">
          <video
            className="w-full h-full object-cover"
            playsInline
            autoPlay
            muted
            loop
            preload="auto"
            poster="/fallback-poster.jpg"
          >
            <source src="/kyveabout.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  </div>

  {/* Right: Copy block */}
  <div className='flex flex-col items-center lg:w-1/2'>
         <div className=" mx-auto px-6 text-center">
                 <h2 className="heading-display mb-4">
                   Our Mission  </h2> </div>
       
         <div className='flex flex-col items-center justify-center leading-relaxed gap-5 text-base text-center md:text-xl md:px-20 text-brand-secondary/30 px-10 mb-10'>
           <p className='text-3xl '>To make every exchange fair, secure, and effortless for everyone.</p>  
           <p className="text-darktext"> Kyve mission is simple: protect both sides and keep value moving with confidence. 
            We create an environment where trust is built in, risks are minimized, and outcomes are clear for buyers and sellers alike.</p>
            <p className="text-darktext">We focus on clarity, accountability, and peace of mind. Clear terms guide each step. Security safeguards commitments. Transparent progress reduces uncertainty.
               Resolution is available when it is needed, so momentum is never lost.</p>
          </div>
       
             
          </div>
</div>

 
        



          <div className='flex flex-1 flex-col bg-[#3b2403] lg:flex-row mb-10'>
   <div className='flex flex-col lg:w-1/2'>
    <div className='px-6 md:px-20 mt-10 lg:px-10'>
            <div
             className="w-full h-[250px] md:h-[350px] lg:h-[450px] bg-no-repeat bg-cover  relative mb-10 "
             style={{ backgroundImage: "url('/founder.png')", }} >
            </div>
         </div>
  </div>

  <div className='flex flex-col items-center lg:w-1/2'>
         <div className=" mx-auto px-6 text-center">
                 <h2 className="heading-display mb-5 text-white">
                   Our History  </h2> </div>

         <div className='flex flex-col items-center justify-center leading-relaxed gap-5 text-[16px] text-center  md:px-20 text-white px-10 mb-10'>
          <p>
    Kyve started with a simple frustration our founder saw over and over while working with small online businesses and crypto users: good people losing time, money, and sleep because trust was hard to prove. From “what I ordered vs. what I got” disappointments to deals where one side had to go first and hope the other would follow through, he spent years helping indie sellers, freelancers, marketplace operators, and on-chain traders navigate delays, disputes, and the risk of someone getting burned.
  </p>

  <p>
    He believed there had to be a better way; practical, fair, and fast. Listening to shop owners worried about chargebacks, buyers anxious about quality, and crypto users needing funds held safely until delivery, he learned what builds confidence: clear terms, protected funds, and reliable release when promises are kept. That became Kyve Escrow—simple to adopt, transparent by design, and strong where it matters. From small ecommerce orders to freelance milestones and crypto transfers, Kyve gives both sides equal protection, a clear path to resolution, and the confidence to move forward.
  </p>
</div>
       
             
          </div>
         </div>

     </div>
    </>
  )
}

export default page;
