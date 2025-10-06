import { ShinyButton } from "@/components/shiny-button"

const page = () => {
     return (
        <>
         <div className='flex flex-col '>
                <div
                 className="backgroundimage"
                 style={{ backgroundImage: "url('/kyve.jpg')", }} >
                </div>
    
       
        <div className='heading-wrap '>
            <a href='/' className='link-with-lines hover:underline text-brand-secondary text-[18px] font-semibold'>Back to kyve</a>
          <h2 className='heading-display mb-5'>Kyve Protection</h2>
        </div>
    
    <div className="flex flex-col lg:flex-row">
        <div className='flex flex-col items-center justify-center leading-relaxed gap-10 text-base text-center md:text-xl md:px-20 lg:px-10 text-darktext px-10 mb-10 lg:w-2/3'>
             <p >
               Doing business with people you do not know can be uncertain, especially in the digital space.
                Buyers worry about not receiving what they paid for, sellers fear not getting paid, and intermediaries often face being left out after making the connection.</p>
              <p>
               Kyve brings confidence to every transaction by securing funds, confirming delivery, and ensuring fairness for everyone involved.
               Whether you are buying, selling, or managing deals between others, Kyve keeps every exchange protected, transparent, and built on trust. </p>
              </div>
    
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



     <div className="flex flex-wrap px-7 md:px-15 gap-4 md:gap-6 py-10">
  {/* Data Protection */}
  <div className="flex flex-1 flex-col items-center justify-center text-center gap-3 min-w-[280px]  rounded-xl border border-slate-200 p-4">
    <svg
      className="h-14 w-14 text-amber-700 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <ellipse cx="12" cy="5" rx="7" ry="3"></ellipse>
      <path d="M5 5v4c0 1.66 3.134 3 7 3s7-1.34 7-3V5"></path>
      <path d="M5 9v4c0 1.66 3.134 3 7 3s7-1.34 7-3V9"></path>
      <path d="M5 13v4c0 1.66 3.134 3 7 3s7-1.34 7-3v-4"></path>
      <path d="M6 11.5c0 3.6 2.2 6.2 6 7.5 3.8-1.3 6-3.9 6-7.5v-2.2a24 24 0 0 1-6 1.7 24 24 0 0 1-6-1.7v2.2z"></path>
      <path d="M11 14.5l1.6 1.6 3.1-3.1"></path>
    </svg>
    <div>
      <h3 className="m-0 text-base font-semibold text-slate-900">Data Protection</h3>
      <p className="m-0 mt-1 text-sm leading-relaxed text-slate-600">
        Your personal and financial information is completely safe because the party involved in the
        transaction never has access to it, ensuring each transaction is secure. Kyve also employs
        cutting‑edge encryption to keep your transaction protected throughout the process.
      </p>
    </div>
  </div>

  {/* Global Protection */}
  <div className="flex flex-1 flex-col items-center justify-center text-center min-w-[280px] gap-3 rounded-xl border border-slate-200 p-4">
    <svg
      className="h-14 w-14 text-amber-700 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 10c1.8-2.6 4.8-4 8-4s6.2 1.4 8 4"></path>
      <path d="M2.5 14c2.2 3 5.6 4.5 9.5 4.5S19.8 17 22 14"></path>
      <path d="M7 7.5c-.6 3.3-.3 6.6 1 9.5"></path>
      <path d="M17 7.5c.6 3.3.3 6.6-1 9.5"></path>
      <path d="M2.8 8.5l2.8-2.8"></path>
      <path d="M21.2 8.5l-2.8-2.8"></path>
      <path d="M4 18.5l2.2-2.2"></path>
      <path d="M20 18.5l-2.2-2.2"></path>
      <path d="M6 9.5a8 8 0 0 0 12 0"></path>
      <path d="M3 9.5c0-.8.7-1.5 1.5-1.5h0"></path>
      <path d="M19.5 8A1.5 1.5 0 1 1 21 9.5"></path>
      <path d="M12 3.5a8.5 8.5 0 0 0 0 17"></path>
    </svg>
    <div>
      <h3 className="m-0 text-base font-semibold text-slate-900">Global Protection</h3>
      <p className="m-0 mt-1 text-sm leading-relaxed text-slate-600">
        Kyve can protect you anywhere on the globe. We provide services in most countries and regions
        and support multiple currencies (NGN, ), so you can safely buy and/or sell
        wherever and whenever you need to.
      </p>
    </div>
  </div>

  {/* Dispute Resolution */}
  <div className="flex flex-1 flex-col items-center justify-center text-center gap-3 min-w-[280px]  rounded-xl border border-slate-200 p-4">
    <svg
      className="h-14 w-14 text-amber-700 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v13"></path>
      <path d="M7 16h10"></path>
      <path d="M5 6h14"></path>
      <path d="M7.5 6l-3 6h5l-2-6z"></path>
      <path d="M16.5 6l3 6h-5l2-6z"></path>
      <circle cx="12" cy="19.5" r="1.5"></circle>
    </svg>
    <div>
      <h3 className="m-0 text-base font-semibold text-slate-900">Dispute Resolution</h3>
      <p className="m-0 mt-1 text-sm leading-relaxed text-slate-600">
        If there is a disagreement during the transaction, Kyve will freeze the funds and the parties
        involved will enter a Dispute Process to reach a fair resolution.
      </p>
    </div>
  </div>
</div>

      
      </div>
    </>
  )
}

export default page
