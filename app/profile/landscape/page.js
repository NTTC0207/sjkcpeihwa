"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@lib/LanguageContext";
import { galleryData } from "@/src/data/gallery";
import {
  IoChevronBack,
  IoChevronForward,
  IoImageOutline,
  IoClose,
} from "react-icons/io5";

const Carousel = ({ images, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length,
    );
  };

  return (
    <div
      className="relative w-full h-full group overflow-hidden cursor-zoom-in"
      onClick={() => onImageClick(images[currentIndex])}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </AnimatePresence>

      {/* Centered Zoom Icon on Hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="p-4 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white transform scale-90 group-hover:scale-100 transition-transform duration-500">
          <IoImageOutline size={24} />
        </div>
      </div>

      {/* Gradient Overlay - pointer-events-none so it doesn't block clicks */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 md:bg-white/10 hover:bg-white/30 backdrop-blur-xl p-2 md:p-3 rounded-full text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform translate-x-0 md:-translate-x-4 md:group-hover:translate-x-0 border border-white/20 shadow-xl z-20"
            aria-label="Previous image"
          >
            <IoChevronBack size={18} className="md:w-5 md:h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 md:bg-white/10 hover:bg-white/30 backdrop-blur-xl p-2 md:p-3 rounded-full text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform translate-x-0 md:translate-x-4 md:group-hover:translate-x-0 border border-white/20 shadow-xl z-20"
            aria-label="Next image"
          >
            <IoChevronForward size={18} className="md:w-5 md:h-5" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2.5 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  index === currentIndex
                    ? "bg-white ring-4 ring-white/20 w-6"
                    : "bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Lightbox = ({ images, activeIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(activeIndex);

  if (!images || images.length === 0) return null;

  const nextSlide = useCallback(
    (e) => {
      e?.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % images.length);
    },
    [images.length],
  );

  const prevSlide = useCallback(
    (e) => {
      e?.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button - Outside the main container to be always clickable */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-6 right-6 text-white/70 hover:text-white transition-all p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md z-[110]"
        aria-label="Close lightbox"
      >
        <IoClose size={32} />
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all p-4 bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-md z-[110]"
            aria-label="Previous image"
          >
            <IoChevronBack size={32} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all p-4 bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-md z-[110]"
            aria-label="Next image"
          >
            <IoChevronForward size={32} />
          </button>
        </>
      )}

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative max-w-7xl max-h-screen w-full h-full flex flex-col items-center justify-center p-4 md:p-12 pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-auto">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
          </AnimatePresence>

          <div className="mt-8 text-center max-w-2xl px-4">
            {images.length > 1 && (
              <p className="text-white/40 text-sm font-bold tracking-widest uppercase">
                {currentIndex + 1} / {images.length}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function LandscapePage() {
  const { translations } = useLanguage();
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [initialIndex, setInitialIndex] = useState(0);

  const tTitle = translations?.nav?.profile?.landscape || "Campus Landscape";
  const tDescription =
    translations?.landscape?.tagline ||
    "Discover the serene environment and modern facilities of SJKC Pei Hwa.";

  const handleOpenLightbox = (galleryItem, index) => {
    setSelectedGallery(galleryItem);
    setInitialIndex(index);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-24">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent-yellow/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container-custom">
        {/* Header Section */}
        <header className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
              {tTitle}
            </h1>
            <div className="w-20 h-1.5 bg-accent-yellow mx-auto rounded-full mb-6"></div>
            <p className="max-w-3xl mx-auto text-gray-600 text-lg md:text-xl leading-relaxed">
              {tDescription}
            </p>
          </motion.div>
        </header>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {galleryData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-700 group border border-gray-100/50 flex flex-col"
            >
              <div className="aspect-[3/2] overflow-hidden relative">
                {item.images.length > 0 ? (
                  <Carousel
                    images={item.images}
                    onImageClick={(img) => {
                      const idx = item.images.findIndex(
                        (i) => i.src === img.src,
                      );
                      handleOpenLightbox(item, idx);
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                    <IoImageOutline className="text-5xl text-gray-200" />
                  </div>
                )}

                {item.images.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase z-20 shadow-xl pointer-events-none">
                    {item.images.length} Photos
                  </div>
                )}
              </div>

              <div className="p-7 flex-grow flex flex-col justify-between bg-gradient-to-b from-white to-gray-50/50">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-500">
                    {item.title}
                  </h3>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-accent-yellow rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium italic">
                      &ldquo;{item.description}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedGallery && (
          <Lightbox
            images={selectedGallery.images}
            activeIndex={initialIndex}
            onClose={() => setSelectedGallery(null)}
          />
        )}
      </AnimatePresence>

      {/* Floating Action Hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-primary/90 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-medium shadow-2xl z-40 border border-white/10 hidden md:block"
      >
        Click images to enlarge • Use arrows for variations
      </motion.div>
    </div>
  );
}
