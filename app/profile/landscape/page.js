"use client";

import { useState } from "react";
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
    <div className="relative w-full h-full group overflow-hidden cursor-zoom-in">
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
          onClick={() => onImageClick(images[currentIndex])}
        />
      </AnimatePresence>

      {/* Gradient Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 md:bg-white/10 hover:bg-white/30 backdrop-blur-xl p-2 md:p-3 rounded-full text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform translate-x-0 md:-translate-x-4 md:group-hover:translate-x-0 border border-white/20 shadow-xl z-10"
            aria-label="Previous image"
          >
            <IoChevronBack size={18} className="md:w-5 md:h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 md:bg-white/10 hover:bg-white/30 backdrop-blur-xl p-2 md:p-3 rounded-full text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform translate-x-0 md:translate-x-4 md:group-hover:translate-x-0 border border-white/20 shadow-xl z-10"
            aria-label="Next image"
          >
            <IoChevronForward size={18} className="md:w-5 md:h-5" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2.5 z-10">
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

const Lightbox = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-12"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2 bg-white/10 rounded-full backdrop-blur-md"
      >
        <IoClose size={32} />
      </button>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative max-w-7xl max-h-full w-full h-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.src}
          alt={image.alt}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        />
        <div className="mt-6 text-center">
          <p className="text-white/90 text-xl font-medium">{image.alt}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function LandscapePage() {
  const { translations } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(null);

  const tTitle = translations?.nav?.profile?.landscape || "Campus Landscape";
  const tDescription =
    translations?.landscape?.tagline ||
    "Discover the serene environment and modern facilities of SJK(C) Pei Hwa.";

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
              <div className="aspect-[4/3] overflow-hidden relative">
                {item.images.length > 0 ? (
                  <Carousel
                    images={item.images}
                    onImageClick={setSelectedImage}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                    <IoImageOutline className="text-5xl text-gray-200" />
                  </div>
                )}

                {item.images.length > 1 && (
                  <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-xl border border-white/30 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase z-20 shadow-lg">
                    {item.images.length} images
                  </div>
                )}
              </div>

              <div className="p-8 flex-grow flex flex-col justify-between bg-gradient-to-b from-white to-gray-50/30">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-500">
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
        {selectedImage && (
          <Lightbox
            image={selectedImage}
            onClose={() => setSelectedImage(null)}
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
