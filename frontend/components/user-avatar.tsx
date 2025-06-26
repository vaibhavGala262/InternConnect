
'use client'; // Important: Mark as client component

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserService from "@/services/user-service";

interface UserAvatarProps {
  userId: number;
  firstName: string;
  lastName: string;
  className?: string;
}

export function UserAvatar({ userId, firstName, lastName, className = "" }: UserAvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      try {
        const url = await UserService.getUserImage(userId);
        if (isMounted) {
          setImageUrl(url);
        }
      } catch (error) {
        console.error("Failed to load user image:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return (
    <Avatar className={className}>
      {!loading && imageUrl && (
        <AvatarImage 
          src={imageUrl} 
          alt={`${firstName} ${lastName}`}
          onError={() => setImageUrl(null)} // Fallback if image fails to load
        />
      )}
      <AvatarFallback>
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-full w-full" />
        ) : (
          <>
            {firstName?.[0]}
            {lastName?.[0]}
          </>
        )}
      </AvatarFallback>
    </Avatar>
  );
}