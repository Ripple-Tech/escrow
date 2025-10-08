"use client"
import { useState, useRef} from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { Variants } from "framer-motion";
import FAQSection from './FAQquestion';

export const slideIn = (
  direction: "left" | "right" | "up" | "down",
  type: "spring" | "tween" | "keyframes",
  delay: number,
  duration: number
): Variants => {
  let x = 0;
  let y = 0;

  if (direction === "left") x = -100;
  if (direction === "right") x = 100;
  if (direction === "up") y = 100;
  if (direction === "down") y = -100;

  return {
    hidden: {
      x,
      y,
    },
    show: {
      x: 0,
      y: 0,
      transition: {
        type,
        delay,
        duration,
        ease: "easeInOut" as const, 
      },
    },
  };
};


const Contact = () => {
    const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({ name: '', email: '', message: '',})
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
   const { name, value } = e.target;
    setForm({ ...form, [name]: value })
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);


    emailjs.send('service_f9nbbn',
     'template_xchhhh', 
     {
      from_name: form.name,
      to_name: 'Kyve',
      from_email: form.email,
      to_email: 'kyvetechnologies@gmail.com',
      message: form.message,
     },
     'r72jWPR6rxn  nn'
    )
    .then(() => {
      setLoading(false);
      alert('Thank you. I will get back to you as soon as possible');

      setForm({
        name: '',
        email: '',
        message: '',
      })
    }, (error) => {
      setLoading(false)
      console.log(error)
      alert('Something went wrong.')
    })

  };

  return (

      <>
         <div className='flex flex-col '>
                 
            <div
             className="w-full h-[250px] md:h-[350px]  lg:h-[450px]  bg-no-repeat bg-cover lg:mt-5 bg-center relative"
             style={{ backgroundImage: "url('/contact-us1.png')", }} >
            </div> 
                </div>
    <div className='flex flex-col mb-11 gap-10 '>
      
      <div className='heading-wrap '>
            <a href='/' className='link-with-lines hover:underline text-brand-secondary text-[18px] font-semibold'>Back to kyve</a>
        
        </div>


         <div className="flex flex-col lg:flex-row">
            <div className="flex flex-col items-center justify-center leading-relaxed gap-10 text-base text-center md:text-xl md:px-20 lg:px-10 text-brand-secondary px-10 mb-10">
              <p className="text-4xl md:text-5xl md:text-start max-w-[500px] lg:max-w-[900px] font-semibold text-center text-brand">
                Have a question?
              </p>
              <p>
                You can call us on{" "}
                <a
                  href="tel:+234 9077144184"
                  className="text-2xl text-center font-bold text-brand-secondary hover:text-brand"
                >
                  +234 9077144184
                </a>{" "}
                 or send us a message below. Our team is always ready to assist you, provide clear answers, 
            and help you resolve any issue related to your transactions or account.
              </p>
            </div>
          </div>

     
    <motion.div
      variants={slideIn('left', "tween", 0.2, 1)}
      className='flex-[0.75] bg-white px-5 mx-10 md:px-20 md:mx-20 p-8 rounded-2xl shadow-lg'
    >
       <h2 className='px-10 text-center text-3xl md:text-[54px] md:leading-[60px] font-bold tracking-tighter text-amber-600 bg-clip-text mt-1'>
       Get in touch </h2>
  
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className='mt-12 flex flex-col gap-8'
      >
        <label className='flex flex-col'>
          <span className='text-gray-800 font-medium mb-4'>Your Name</span>
          <input 
            type='text'
            name='name'
            value={form.name}
            onChange={handleChange}
            placeholder="What's your name"
            className='bg-gray-100 py-4 px-6 placeholder:text-gray-500 text-gray-800 rounded-lg border border-gray-300 font-medium focus:outline-[#324F3B]'
          />
        </label>
  
        <label className='flex flex-col'>
          <span className='text-gray-800 font-medium mb-4'>Your Email Address</span>
          <input 
            type='email'
            name='email'
            value={form.email}
            onChange={handleChange}
            placeholder="What's your Email Address"
            className='bg-gray-100 py-4 px-6 placeholder:text-gray-500 text-gray-800 rounded-lg border border-gray-300 font-medium focus:outline-[#324F3B]'
          />
        </label>
  
        <label className='flex flex-col'>
          <span className='text-gray-800 font-medium mb-4'>Your Message</span>
          <textarea
            rows={7}
            name='message'
            value={form.message}
            onChange={handleChange}
            placeholder="What do you want to say?"
            className='bg-gray-100 py-4 px-6 placeholder:text-gray-500 text-gray-800 rounded-lg border border-gray-300 font-medium focus:outline-[#324F3B]'
          />
        </label>
  
        <button
          type='submit'
          className='bg-amber-600 py-3 px-8 outline-none w-fit text-white font-bold shadow-md hover:shadow-lg rounded-xl transition-all duration-200'
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </motion.div>
  
    <motion.div
      variants={slideIn('right', "tween", 0.2, 1)}
      className='flex flex-col flex-1 xl:h-auto md-h-[550px] mt-10 h-[350px] mb-20'
    >
     <FAQSection/>
    </motion.div>

    

  </div>
 
  </>
  )
}

export default Contact