'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import UserService from '@/services/user-service'

interface UserAvatarProps {
  userId: number
  firstName: string
  lastName: string
  className?: string
}

export function UserAvatar({ userId, firstName, lastName, className = '' }: UserAvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchImage = async (cacheBust = true) => {
    try {
      const url = await UserService.getUserImage(userId, cacheBust)
      if (!loading) setImageUrl(url)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load user image:', error)
      setLoading(false)
    }
  }

  // Load the image on mount and whenever the user changes.
  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const url = await UserService.getUserImage(userId, true)
        if (isMounted) {
          setImageUrl(url)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load user image:', error)
        if (isMounted) setLoading(false)
      }
    }

    load()

    // Refresh the avatar the instant a new image is uploaded (profile page → Circle).
    const handleImageUpdated = () => {
      if (isMounted) {
        setImageUrl(null)
        setLoading(true)
        load()
      }
    }

    window.addEventListener('profile-image-updated', handleImageUpdated)

    return () => {
      isMounted = false
      window.removeEventListener('profile-image-updated', handleImageUpdated)
    }
  }, [userId])

  return (
    <Avatar className={className}>
      {imageUrl && <AvatarImage src={imageUrl} alt={`${firstName} ${lastName}`} />}
      <AvatarFallback className={loading ? 'animate-pulse bg-gray-200' : ''}>
        {firstName?.[0]}
        {lastName?.[0]}
      </AvatarFallback>
    </Avatar>
  )
}
