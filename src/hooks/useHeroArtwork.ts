import { useState, useEffect } from 'react';

export const STORAGE_KEY_HERO_ARTWORK = 'myspace_hero_artwork_image';
export const LEGACY_STORAGE_KEY_LOGIN = 'myspace_login_hero_image';

export const CANDIDATE_IMAGE_PATHS = [
  '/ChatGPT Image Sep 17, 2026, 09_23_01 PM.png',
  '/ChatGPT%20Image%20Sep%2017,%202026,%2009_23_01%20PM.png',
  '/chatgpt-sunset.png',
  '/sunset-ridge.png',
  '/ChatGPT Image Sep 17, 2026, 07_23_06 AM.png',
  '/ChatGPT%20Image%20Sep%2017,%202026,%2007_23_06%20AM.png',
];

export function useHeroArtwork() {
  const [customImage, setCustomImage] = useState<string | null>(() => {
    return (
      localStorage.getItem(STORAGE_KEY_HERO_ARTWORK) ||
      localStorage.getItem(LEGACY_STORAGE_KEY_LOGIN) ||
      null
    );
  });

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [candidatesExhausted, setCandidatesExhausted] = useState(false);

  // Sync across tabs and components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_HERO_ARTWORK || e.key === LEGACY_STORAGE_KEY_LOGIN) {
        setCustomImage(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleImageError = () => {
    if (customImage) {
      // If custom image failed to load, clear it
      setCustomImage(null);
      localStorage.removeItem(STORAGE_KEY_HERO_ARTWORK);
    } else {
      // Try next candidate file path
      if (candidateIndex + 1 < CANDIDATE_IMAGE_PATHS.length) {
        setCandidateIndex((prev) => prev + 1);
      } else {
        setCandidatesExhausted(true);
      }
    }
  };

  // Determine which image string to render
  const candidatePath = !candidatesExhausted ? CANDIDATE_IMAGE_PATHS[candidateIndex] : null;
  const activeImage = customImage || candidatePath;

  return {
    activeImage,
    isCustom: !!customImage,
    handleImageError,
  };
}
