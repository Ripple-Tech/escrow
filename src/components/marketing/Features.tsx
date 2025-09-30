import Image from "next/image";
import { Heading } from "../heading";

export type FeatureItem = {
  id: string;
  img: string;   
  alt: string;
};

export const featuresData: FeatureItem[] = [
  { id: "feature-1", img: "/feature1.jpg", alt: "Multi Currency" },
  { id: "feature-2", img: "/feature2.jpg", alt: "Kyve Protection" },
  { id: "feature-3", img: "/feature3.jpg", alt: "KYC Verification" },
  { id: "feature-4", img: "/feature4.jpg", alt: "Solve Dispute" },
  { id: "feature-5", img: "/feature5.jpg", alt: "Risk Reduction" },
];

const Features: React.FC = () => {
  return (
    <section className="w-full bg-amber-200 px-0 py-10 mb-10 mt-10">
      <Heading className="text-center mb-10">Key Features</Heading>

      <div className="flex flex-col gap-12 px-6 sm:px-8 max-w-6xl mx-auto">
        {/* Top row - 3 items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuresData.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              <div className="aspect-square w-full overflow-hidden rounded-lg">
                <Image
                  src={item.img}
                  alt={item.alt}
                  width={400}
                  height={400}
                  className="h-full w-full object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={false}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row - 2 items centered with larger gap */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 max-w-2xl">
            {featuresData.slice(3, 5).map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
              >
                <div className="aspect-square w-full overflow-hidden rounded-lg">
                  <Image
                    src={item.img}
                    alt={item.alt}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover"
                    sizes="(max-width: 768px) 100vw, 45vw"
                    priority={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;