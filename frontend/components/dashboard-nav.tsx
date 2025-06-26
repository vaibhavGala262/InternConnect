"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Home, MessageSquare, Briefcase, User, LogOut  , Info, Contact} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { info } from "console"
import { toast } from "./ui/use-toast"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export function DashboardNav({ userType }: { userType: "student" | "teacher" }) {
  const pathname = usePathname()
  const router = useRouter()

  const studentNavItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Internships",
      href: "/dashboard/internships",
      icon: Briefcase,
    },
    {
      title: "My Applications",
      href: "/dashboard/applications",
      icon: Briefcase,
    },
    {
      title: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
    },
    {
      title: "Profile",
      href: "/dashboard/profile" ,
      icon : User
     
    },
    
  ]

  const teacherNavItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "My Internships",
      href: "/dashboard/my-internships",
      icon: Briefcase,
    },
    {
      title: "Create Internship",
      href: "/dashboard/create-internship",
      icon: Briefcase,
    },
    {
      title: "Applications",
      href: "/dashboard/applications",
      icon: Briefcase,
    },
    {
      title: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
  ]

  const navItems = userType === "student" ? studentNavItems : teacherNavItems

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("token")
    localStorage.removeItem("userType")

    toast({
      title: "Successfully Logged Out",
      description: "",
      variant: "default",
    })

    // Redirect to login page
    router.push("/login")
  }

  return (
    <div className="flex h-screen flex-col border-r bg-background h-screen fixed left-0 top-0 w-[your-width] overflow-y-auto">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <BookOpen className="h-6 w-6" />
          <span>InternConnect</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                pathname === item.href && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button variant="outline" className="w-full justify-start gap-3" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
