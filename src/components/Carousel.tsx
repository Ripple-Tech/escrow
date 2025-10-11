import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, PanInfo, useMotionValue, useTransform, Transition, MotionValue } from 'motion/react';
import React, { JSX } from 'react';

export interface CarouselItem {
  description: string;
  id: number;
  image: string;
  link: string;
}

export interface CarouselProps {
  items?: CarouselItem[];
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  round?: boolean;
}

const DEFAULT_ITEMS: CarouselItem[] = [
  {
    description: 'Learn more about our company and mission.',
    id: 1,
    image: '/about-us1.png',
    link: '/about-us'
  },
  {
    description: 'Get in touch with our team for any inquiries.',
    id: 2,
    image: '/contact-us1.png',
    link: '/contact-us'
  },
  {
    description: 'Discover our wide range of professional services.',
    id: 3,
    image: '/our-services1.png',
    link: '/services'
  },
  {
    description: 'Our comprehensive protection and security solutions.',
    id: 4,
    image: '/protection1.png',
    link: '/kyve-protection'
  }
];

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS: Transition = { type: 'spring', stiffness: 300, damping: 30 };

// Separate component for carousel items to use hooks properly
interface CarouselItemComponentProps {
  item: CarouselItem;
  index: number;
  x: MotionValue<number>;
  trackItemOffset: number;
  round: boolean;
  itemWidth: number;
  effectiveTransition: Transition;
}

const CarouselItemComponent: React.FC<CarouselItemComponentProps> = ({
  item,
  index,
  x,
  trackItemOffset,
  round,
  itemWidth,
  effectiveTransition
}) => {
  const range = useMemo(() => [
    -(index + 1) * trackItemOffset,
    -index * trackItemOffset, 
    -(index - 1) * trackItemOffset
  ], [index, trackItemOffset]);

  const outputRange = useMemo(() => [90, 0, -90], []);
  const rotateY = useTransform(x, range, outputRange, { clamp: false });

  const handleClick = () => {
    window.location.href = item.link;
  };

  return (
    <motion.div
      className={`relative shrink-0 overflow-hidden cursor-pointer transition-all duration-300 ${
        round ? 'rounded-full' : 'rounded-lg'
      } shadow-md hover:shadow-lg group w-full`} // Added w-full here
      style={{
        width: itemWidth,
        height: round ? itemWidth : '150px', // Further reduced height
        rotateY: rotateY,
      }}
      transition={effectiveTransition}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Image with Text Overlay */}
      <div className="relative w-full h-full">
        <img 
          src={item.image} 
          alt=""
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZDQxMDNhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-900/90 via-amber-800/50 to-transparent" />
        
        {/* Text Content Overlay - Title removed */}
        <div className="absolute bottom-0 left-0 right-0 p-2 text-white"> {/* Further reduced padding */}
          <p className="text-amber-100 text-xs leading-tight mb-1 drop-shadow-sm line-clamp-2">{item.description}</p> {/* Smaller text, 2 lines max */}
          
          {/* CTA Button */}
          <div className="flex items-center justify-between">
            <span className="text-amber-200 font-medium text-xs">Learn More</span> {/* Smaller text */}
            <div className="flex items-center justify-center w-5 h-5 bg-amber-600 rounded-full transition-all duration-200 group-hover:bg-amber-700 group-hover:scale-110"> {/* Smaller button */}
              <svg 
                className="w-2 h-2 text-white"  // Smaller icon
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Carousel({
  items = DEFAULT_ITEMS,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false
}: CarouselProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  
  // Calculate responsive item width - now full width of container
  const itemWidth = containerWidth; // Full width
  const trackItemOffset = itemWidth + GAP;

  const carouselItems = loop ? [...items, items[0]] : items;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Update container width on resize and mount
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (autoplay && (!pauseOnHover || !isHovered)) {
      const timer = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev === items.length - 1 && loop) {
            return prev + 1;
          }
          if (prev === carouselItems.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
      }, autoplayDelay);
      return () => clearInterval(timer);
    }
  }, [autoplay, autoplayDelay, isHovered, loop, items.length, carouselItems.length, pauseOnHover]);

  const effectiveTransition: Transition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      if (loop && currentIndex === items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(prev => Math.min(prev + 1, carouselItems.length - 1));
      }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      if (loop && currentIndex === 0) {
        setCurrentIndex(items.length - 1);
      } else {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
      }
    }
  };

  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * (carouselItems.length - 1),
          right: 0
        }
      };

  // Don't render until we have container width
  if (containerWidth === 0) {
    return (
      <div 
        ref={containerRef} 
        className="w-full h-[150px] bg-amber-50 rounded-lg animate-pulse flex items-center justify-center" // Reduced height
      >
        <div className="text-amber-600 font-medium text-sm">Loading...</div> {/* Smaller text */}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden  flex flex-1 mx-auto w-full ${
        round ? 'rounded-full border border-amber-200' : 'rounded-xl border border-amber-200 bg-white'
      }`}
    >
      <motion.div
        className="flex"
        drag="x"
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${currentIndex * trackItemOffset + itemWidth / 2}px 50%`,
          x
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => (
          <CarouselItemComponent
            key={index}
            item={item}
            index={index}
            x={x}
            trackItemOffset={trackItemOffset}
            round={round}
            itemWidth={itemWidth}
            effectiveTransition={effectiveTransition}
          />
        ))}
      </motion.div>
      <div className={`flex w-full justify-center ${round ? 'absolute z-20 bottom-1 left-1/2 -translate-x-1/2' : ''}`}> {/* Adjusted position */}
        <div className="mt-3 flex w-[70px] justify-between px-2"> {/* Smaller container */}
          {items.map((_, index) => (
            <motion.div
              key={index}
              className={`h-1.5 w-1.5 rounded-full cursor-pointer transition-colors duration-150 ${
                currentIndex % items.length === index
                  ? 'bg-amber-600'
                  : 'bg-amber-300'
              }`} // Smaller dots
              animate={{
                scale: currentIndex % items.length === index ? 1.2 : 1
              }}
              onClick={() => setCurrentIndex(index)}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}