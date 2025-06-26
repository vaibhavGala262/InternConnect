"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userType, setUserType] = useState<"student" | "teacher" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token")
    const storedUserType = localStorage.getItem("userType") as "student" | "teacher" | null

    if (!token) {
      router.push("/login")
      return
    }

    setUserType(storedUserType)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!userType) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block w-64">
        <DashboardNav userType={userType} />
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
