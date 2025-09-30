"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Footer,
  FooterCopyright,
  FooterIcon,
  FooterLink,
  FooterLinkGroup,
  FooterTitle,
} from "flowbite-react";
import {
  BsDribbble,
  BsFacebook,
  BsGithub,
  BsInstagram,
  BsTwitter,
} from "react-icons/bs";
import { Star } from "lucide-react";
import { ShinyButton } from "@/components/shiny-button";

export function Foot() {
  return (
    <>
      <Footer className="custom-footer" style={{ backgroundColor: "#3b2403" }}>
        <div className="w-full">
          {/* Top grid */}
          <div className="grid w-full grid-cols-2 gap-8 px-6 py-8 md:grid-cols-4">
            <div>
              <FooterTitle title="Company" />
              <FooterLinkGroup col>
                <FooterLink href="#" className="!text-gray-200">About</FooterLink>
                <FooterLink href="#" className="!text-gray-200">Careers</FooterLink>
                <FooterLink href="#" className="!text-gray-200">Brand Center</FooterLink>
                <FooterLink href="#" className="!text-gray-200">Blog</FooterLink>
              </FooterLinkGroup>
            </div>

            <div>
              <FooterTitle title="Help Center" />
              <FooterLinkGroup col>
                <FooterLink href="#" className="!text-gray-200">Discord Server</FooterLink>
                <FooterLink href="#" className="!text-gray-200">Twitter</FooterLink>
                <FooterLink href="#" className="!text-gray-200">Facebook</FooterLink>
                <FooterLink href="#" className="!text-gray-200">Contact Us</FooterLink>
              </FooterLinkGroup>
            </div>

            <div>
              <FooterTitle title="Legal" />
              <FooterLinkGroup col>
                <FooterLink href="#" className="!text-gray-200">Privacy Policy</FooterLink>
                <FooterLink href="#" className="!text-gray-200">Licensing</FooterLink>
                <FooterLink href="#" className="!text-gray-200">Terms &amp; Conditions</FooterLink>
              </FooterLinkGroup>
            </div>

            {/* Download column with store buttons */}
            <div>
              <FooterTitle title="Download" />
              <div className="mt-3 flex flex-col items-start gap-3">
                <Link
                  href="https://play.google.com"
                  aria-label="Get it on Google Play"
                  className="hover:opacity-90 transition no-text-override"
                >
                  <Image
                    src="/playstore.png"
                    alt="Get it on Google Play"
                    width={200}
                    height={64}
                    className="h-auto w-[200px] max-w-full cursor-pointer"
                    priority={false}
                  />
                </Link>
                <Link
                  href="https://apple.com/app-store"
                  aria-label="Download on the App Store"
                  className="hover:opacity-90 transition no-text-override"
                >
                  <Image
                    src="/appstore.png"
                    alt="Download on the App Store"
                    width={200}
                    height={64}
                    className="h-auto w-[200px] max-w-full cursor-pointer"
                    priority={false}
                  />
                </Link>

                {/* Optional tagline */}
                <p className="font-semibold mt-2 text-[15px] text-gray-200">
                  Download Kyve App Today!
                </p>

                {/* Optional rating + CTA */}
                <div className="flex flex-col items-start gap-3">
                  <div className="flex gap-1">
                    <Star className="size-4 text-brand-600 fill-[#fb9e08]" />
                    <Star className="size-4 text-brand-600 fill-[#fb9e08]" />
                    <Star className="size-4 text-brand-600 fill-[#fb9e08]" />
                    <Star className="size-4 text-brand-600 fill-[#fb9e08]" />
                    <Star className="size-4 text-brand-600 fill-[#fb9e08]" />
                  </div>
                  
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="w-full px-4 py-6 sm:flex sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <FooterCopyright href="#" by="Kyve™" year={2025} className="!text-gray-200" />
              <div className="flex items-center gap-3 sm:hidden">
                <Link
                  href="https://play.google.com"
                  aria-label="Get it on Google Play"
                  className="hover:opacity-90 transition no-text-override"
                >
                  <Image
                    src="/playstore.png"
                    alt="Get it on Google Play"
                    width={140}
                    height={48}
                    className="h-auto w-[140px] max-w-full"
                  />
                </Link>
                <Link
                  href="https://apple.com/app-store"
                  aria-label="Download on the App Store"
                  className="hover:opacity-90 transition no-text-override"
                >
                  <Image
                    src="/appstore.png"
                    alt="Download on the App Store"
                    width={140}
                    height={48}
                    className="h-auto w-[140px] max-w-full"
                  />
                </Link>
              </div>
            </div>

            <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
              <FooterIcon href="#" icon={BsFacebook} className="!text-gray-200" />
              <FooterIcon href="#" icon={BsInstagram} className="!text-gray-200" />
              <FooterIcon href="#" icon={BsTwitter} className="!text-gray-200" />
              <FooterIcon href="#" icon={BsGithub} className="!text-gray-200" />
              <FooterIcon href="#" icon={BsDribbble} className="!text-gray-200" />
            </div>
          </div>
        </div>
      </Footer>

      {/* Scoped CSS override: forces readable text color on components that set their own color.
          Elements with the "no-text-override" class (badges, buttons) are left alone. */}
      <style jsx>{`
        .custom-footer * {
          color: #e5e7eb !important; /* tailwind gray-200 */
        }
        .custom-footer svg {
          color: #e5e7eb !important;
          fill: #e5e7eb !important;
          stroke: #e5e7eb !important;
        }
        /* keep images and anything marked no-text-override untouched */
        .custom-footer .no-text-override,
        .custom-footer .no-text-override * {
          color: unset !important;
          fill: unset !important;
          stroke: unset !important;
        }
      `}</style>
    </>
  );
}
