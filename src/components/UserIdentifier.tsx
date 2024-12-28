'use client';
import { useEffect } from 'react';
import { getFingerprint } from '@thumbmarkjs/thumbmarkjs';

const UserIdentifier = () => {
  useEffect(() => {
    const setThumbmarkCookie = async () => {
      const thumbmark = await getFingerprint();
      document.cookie = `thumbmark=${thumbmark}; path=/; max-age=31536000`; // Set cookie for 1 year
    };

    setThumbmarkCookie();
  }, []);

  return null; // This component doesn't need to render anything
};

export default UserIdentifier;