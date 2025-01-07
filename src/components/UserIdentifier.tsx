'use client';
import { useEffect } from 'react';
import { getFingerprint } from '@thumbmarkjs/thumbmarkjs';

const UserIdentifier = () => {
  useEffect(() => {
    const setUserIdCookie = async () => {
      const userId = await getFingerprint();
      document.cookie = `userId=${userId}; path=/; max-age=31536000`; // Set cookie for 1 year
    };

    setUserIdCookie();
  }, []);

  return null; // This component doesn't need to render anything
};

export default UserIdentifier;