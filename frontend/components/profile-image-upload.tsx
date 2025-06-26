"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import UserService from "@/services/user-service"

interface ProfileImageUploadProps {
  userId: number
  firstName: string
  lastName: string
  onImageUploaded: () => void
}

export function ProfileImageUpload({ userId, firstName, lastName, onImageUploaded }: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [imageKey, setImageKey] = useState(Date.now()) // to force refresh
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)
      await UserService.uploadProfileImage(file)

      toast({
        title: "Success",
        description: "Profile image uploaded successfully",
      })

      // Notify parent component
      onImageUploaded()

      // Refresh the image
      setImageKey(Date.now())
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const url = await UserService.getUserImage(userId)
        setImageUrl(url)
      } catch (err) {
        console.error("Failed to load profile image", err)
        setImageUrl(null)
      }
    }

    fetchImage()
  }, [userId, imageKey]) // re-fetch on upload

  return (
    <div className="relative">
      <Avatar className="h-32 w-32">
        <AvatarImage src={imageUrl || undefined} alt={`${firstName} ${lastName}`} />
        <AvatarFallback className="text-3xl">
          {firstName?.[0]}
          {lastName?.[0]}
        </AvatarFallback>
      </Avatar>

      <Button
        size="icon"
        variant="outline"
        className="absolute bottom-0 right-0 rounded-full bg-background h-8 w-8"
        onClick={handleUploadClick}
        disabled={isUploading}
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        <span className="sr-only">Upload avatar</span>
      </Button>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
    </div>
  )
}
