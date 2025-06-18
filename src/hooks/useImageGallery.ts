
import { useState } from 'react';

interface ImageGalleryState {
  selectedIndex: number;
  isModalOpen: boolean;
}

export const useImageGallery = (images: string[] = []) => {
  const [state, setState] = useState<ImageGalleryState>({
    selectedIndex: 0,
    isModalOpen: false
  });

  const selectImage = (index: number) => {
    setState(prev => ({ ...prev, selectedIndex: index }));
  };

  const openModal = (index: number = state.selectedIndex) => {
    setState(prev => ({ ...prev, selectedIndex: index, isModalOpen: true }));
  };

  const closeModal = () => {
    setState(prev => ({ ...prev, isModalOpen: false }));
  };

  const nextImage = () => {
    setState(prev => ({
      ...prev,
      selectedIndex: (prev.selectedIndex + 1) % images.length
    }));
  };

  const previousImage = () => {
    setState(prev => ({
      ...prev,
      selectedIndex: prev.selectedIndex === 0 ? images.length - 1 : prev.selectedIndex - 1
    }));
  };

  return {
    selectedIndex: state.selectedIndex,
    isModalOpen: state.isModalOpen,
    selectImage,
    openModal,
    closeModal,
    nextImage,
    previousImage,
    currentImage: images[state.selectedIndex] || null,
    hasImages: images.length > 0
  };
};
