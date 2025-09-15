import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import chevronLeft from "../assets/chevron-left.svg";
import chevronRight from "../assets/chevron-right.svg";

export interface Slide {
  image: string;
  link: string;
  alt: string;
  title?: string;   // Optional caption title
  subtitle?: string; // Optional caption text
}

interface SlideshowProps {
  slides: Slide[];
  autoPlay?: boolean;
  interval?: number;
}

export default function Slideshow({
  slides,
  autoPlay = true,
  interval = 6000,
}: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto change
  useEffect(() => {
    if (!autoPlay || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length, isPaused]);

  const goToPrev = () =>
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % slides.length);

  // Swipe gestures
  const handlers = useSwipeable({
    onSwipedLeft: goToNext,
    onSwipedRight: goToPrev,
    trackMouse: true,
  });

  return (
    <div
      {...handlers}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full overflow-hidden aspect-[3/1] bg-gray-100 rounded-2xl shadow-lg mt-15 min-h-[150px]"
    >
      {slides.map((slide, i) => (
        <a
          key={i}
          href={slide.link}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.alt}
            className="w-full h-full object-cover"
          />

          {/* Optional overlay caption */}
          {(slide.title || slide.subtitle) && (
            <div className="absolute bottom-8 left-8 bg-black/50 p-4 rounded-lg text-white max-w-xs">
              {slide.title && (
                <h2 className="text-lg md:text-2xl font-semibold">
                  {slide.title}
                </h2>
              )}
              {slide.subtitle && (
                <p className="mt-1 text-sm md:text-base">{slide.subtitle}</p>
              )}
            </div>
          )}
        </a>
      ))}

      {/* Left Arrow */}
      <button
        onClick={goToPrev}
        className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 sm:p-3 rounded-full z-15"
      >
        <img src={chevronLeft} alt="Previous" className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={goToNext}
        className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 sm:p-3 rounded-full z-15"
      >
        <img src={chevronRight} alt="Next" className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden sm:flex gap-2 z-15">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-3 h-3 rounded-full transition-colors ${
              i === currentIndex ? "bg-white" : "bg-white/50 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
