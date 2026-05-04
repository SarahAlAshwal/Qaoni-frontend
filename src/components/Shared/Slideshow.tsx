import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import chevronLeft from "../../assets/chevron-left.svg";
import chevronRight from "../../assets/chevron-right.svg";

export interface Slide {
  image: string;
  link: string;
  alt: string;
  title?: string;
  subtitle?: string;
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

  useEffect(() => {
    if (slides.length === 0) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((prev) => Math.min(prev, slides.length - 1));
  }, [slides.length]);

  useEffect(() => {
    if (!autoPlay || isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length, isPaused]);

  const goToPrev = () =>
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % slides.length);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (slides.length > 1) {
        goToNext();
      }
    },
    onSwipedRight: () => {
      if (slides.length > 1) {
        goToPrev();
      }
    },
    trackMouse: true,
  });

  if (slides.length === 0) {
    return (
      <div
        className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-10 text-center text-gray-500 shadow-lg"
        style={{ maxHeight: "500px", minHeight: "300px", height: "45vh" }}
      >
        No slideshow images available yet.
      </div>
    );
  }

  return (
    <div
      {...handlers}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg"
      style={{ maxHeight: '500px', minHeight: '300px', height: '45vh' }}
    >
      {slides.map((slide, i) => (
        <a
          key={i}
          href={slide.link}
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${
            i === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.alt}
            className="max-w-full max-h-full object-contain p-4 sm:p-8"
          />

          {/* Optional overlay caption */}
          {(slide.title || slide.subtitle) && (
            <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-auto bg-gradient-to-r from-black/70 to-black/50 backdrop-blur-sm p-4 sm:p-5 rounded-xl text-white max-w-md shadow-xl">
              {slide.title && (
                <h2 className="text-base sm:text-xl md:text-2xl font-bold mb-1">
                  {slide.title}
                </h2>
              )}
              {slide.subtitle && (
                <p className="text-xs sm:text-sm md:text-base opacity-90">
                  {slide.subtitle}
                </p>
              )}
            </div>
          )}
        </a>
      ))}

      {/* Left Arrow */}
      <button
        onClick={goToPrev}
        aria-label="Previous slide"
        className="absolute top-1/2 left-3 sm:left-5 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl p-2 sm:p-3 rounded-full z-20 transition-all duration-200 hover:scale-110 cursor-pointer"
      >
        <img src={chevronLeft} alt="" className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={goToNext}
        aria-label="Next slide"
        className="absolute top-1/2 right-3 sm:right-5 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl p-2 sm:p-3 rounded-full z-20 transition-all duration-200 hover:scale-110 cursor-pointer"
      >
        <img src={chevronRight} alt="" className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-full">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              i === currentIndex
                ? "bg-white w-8 h-3"
                : "bg-white/60 hover:bg-white/80 w-3 h-3"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
