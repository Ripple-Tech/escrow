"use client"

import { BenefitCard } from '@/components/card/BenefitCard'
import { ShinyButton } from '@/components/shiny-button'
import { homeBenefitsData } from "@/data"
import React from 'react'

export const ServiceClient = () => {
  return (
    <>
      <div className='flex flex-col items-center'>
        
        {/* Hero background */}
        <div
          className="backgroundimage"
          style={{ backgroundImage: "url('/kyve.jpg')" }}
        />

        {/* Heading */}
        <div className='heading-wrap'>
          <a 
            href='/' 
            className='link-with-lines hover:underline text-brand-secondary text-[18px] font-semibold'
          >
            Back to Kyve
          </a>
          <h2 className='heading-display py-5'>Our Services</h2>
        </div>

        {/* Intro paragraphs */}
        <div className='paragraphtextdiv py-5 px-10'>
          <p>
            At Kyve, we ensure that every transaction is handled with trust, security, and fairness. 
            Whether you’re a buyer, seller, or business partner, our escrow services are designed 
            to protect both sides until all agreed conditions are met. 
          </p>
          <p>
            We know that global commerce is built on confidence. 
            That’s why Kyve provides a safe middle layer — holding funds, verifying identities, 
            and offering dispute resolution — so you can focus on doing business while we safeguard the process.
          </p>

          <div className='flex flex-col border items-center justify-center rounded-lg mt-10 mx-10 h-[150px] w-[300px] sm:w-[400px] border-brand-accent p-4'>
            <p className='text-2xl font-semibold text-center text-brand'>
              Need help right now? Reach out to our support team
            </p>
            <a 
               href="tel:+234 9077144184" 
              className="text-2xl text-center font-bold mt-3 text-brand-secondary hover:text-brand"
            >
              + 234 9077144184
            </a> 
          </div>
        </div>

        {/* Benefits */}
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 heading-wrap">
            <h2 className="heading-display">
              What We Offer
            </h2>
          </div>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 px-10 mb-10 md:mb-15 md:grid-cols-3 gap-8 md:gap-10">
            {homeBenefitsData.map((benefit, idx) => (
              <BenefitCard 
                key={benefit.id} 
                benefit={benefit} 
                idx={idx} 
                variant='plain'
              />
            ))}
          </div>

          {/* Middle banner */}
          <div className='px-6 md:px-20 lg:px-40'>
            <div
              className="backgroundimage mb-10"
              style={{ backgroundImage: "url('/hero4ky.png')" }}
            />
          </div>

          {/* Process */}
          <div className="mb-10 heading-wrap">
            <h2 className="heading-display">
              Our Process
            </h2> 
          </div>
        </div>

        {/* Process explanation */}
        <div className='paragraphtextdiv'>
          <p>
            We at Kyve have built a clear and transparent escrow process. 
            From the moment funds are deposited, they remain securely locked until 
            both buyer and seller fulfill the agreed conditions. 
          </p>
          <p>
            Our five-step approach ensures confidence: deposit, verification, delivery, confirmation, and release. 
            If disagreements arise, our dispute resolution process steps in to ensure fairness and impartiality. 
            With Kyve, you don’t just transact — you transact with peace of mind.
          </p>
        </div>

        {/* CTA button */}
        <ShinyButton
          href="/auth/register"
          className="relative z-10 h-14 w-full max-w-xs mb-20 bg-primary text-base shadow-lg transition-shadow duration-300 hover:shadow-xl"
        >
          Our Five Steps
        </ShinyButton>

        {/* Final section */}
        <div className='flex flex-col border px'>
          <h3 className='text-2xl sm:text-3xl md:text-4xl px-5
            text-center font-semibold mb-4 leading-snug text-brand-secondary'>
            Already know which escrow service you need?
          </h3>
        </div>

      </div>
    </>
  )
}
