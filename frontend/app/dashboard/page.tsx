"use client"

import { JSX, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Briefcase, MessageSquare, Users, BookOpen, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import StatsService from "@/services/stats-service"
import AuthService from "@/services/auth-service"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"

// Define types for the data structure
interface User {
  id: number;
  type: "student" | "teacher";
  first_name: string;
  last_name: string;
}

interface Sender {
  first_name: string;
  last_name: string;
}

interface Message {
  content: string;
  sender: Sender;
  sent_at: string;
}

interface Internship {
  title: string;
  company_name: string;
  created_at: string;
  deadline: string;
  is_active: boolean;
}

interface DashboardStats {
  total_internships: number;
  total_interships_lastweek: number;
  latest_internship: Internship | null;
  total_students: number;
  total_students_lastweek: number;
  total_teachers: number;
  total_teachers_lastweek: number;
  total_unread_messages: number;
  total_unread_messages_lastweek: number;
  latest_message: Message | null;
}

interface ActivityItem {
  type: string;
  icon: JSX.Element;
  title: string;
  description: string;
  content: string;
  time: string;
}

export default function DashboardPage() {
  const [userType, setUserType] = useState<"student" | "teacher" | null>(null)
  const [userName, setUserName] = useState("")
  const [userId, setUserId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    total_internships: 0,
    total_interships_lastweek: 0,
    latest_internship: null,
    total_students: 0,
    total_students_lastweek: 0,
    total_teachers: 0,
    total_teachers_lastweek: 0,
    total_unread_messages: 0,
    total_unread_messages_lastweek: 0,
    latest_message: null,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch user data
        const userData = await AuthService.getCurrentUser() as User
        setUserType(userData.type)
        setUserName(`${userData.first_name} ${userData.last_name}`)
        setUserId(userData.id)

        // Fetch dashboard stats
        const stats = await StatsService.getDashboardStats() as DashboardStats
        setDashboardStats(stats)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Format date to relative time (e.g., "2 days ago")
  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return "recently"
    }
  }

  // Update the loading state to show a proper loading indicator
  if (isLoading) {
    return (
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <div className="md:hidden">
            <Button variant="outline" size="icon" className="mr-2">
              <span className="sr-only">Toggle menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-xl">Dashboard</h1>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Prepare recent activity items based on available data
  const recentActivityItems: ActivityItem[] = []

  // Add latest message to activity if available
  if (dashboardStats.latest_message) {
    recentActivityItems.push({
      type: "message",
      icon: <MessageSquare className="h-4 w-4" />,
      title: "New message received",
      description: `${dashboardStats.latest_message.sender.first_name} ${dashboardStats.latest_message.sender.last_name} sent you a message`,
      content:
        dashboardStats.latest_message.content.length > 30
          ? `${dashboardStats.latest_message.content.substring(0, 30)}...`
          : dashboardStats.latest_message.content,
      time: formatRelativeTime(dashboardStats.latest_message.sent_at),
    })
  }

  // Add latest internship to activity if available
  if (dashboardStats.latest_internship) {
    recentActivityItems.push({
      type: "internship",
      icon: <Briefcase className="h-4 w-4" />,
      title: userType === "student" ? "New internship posted" : "You posted a new internship",
      description: dashboardStats.latest_internship.title,
      content: `at ${dashboardStats.latest_internship.company_name}`,
      time: formatRelativeTime(dashboardStats.latest_internship.created_at),
    })
  }

  // Add placeholder activity if no real data is available
  if (recentActivityItems.length === 0) {
    recentActivityItems.push({
      type: "placeholder",
      icon: <Clock className="h-4 w-4" />,
      title: "No recent activity",
      description: "Your recent activities will appear here",
      content: "",
      time: "now",
    })
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="md:hidden">
          <Button variant="outline" size="icon" className="mr-2">
            <span className="sr-only">Toggle menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold md:text-xl">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Welcome, {userName}</span>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {userType === "student" ? "Available Internships" : "Posted Internships"}
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.total_internships}</div>
              <p className="text-xs text-muted-foreground">
                +{dashboardStats.total_interships_lastweek} since last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {userType === "student" ? "Applications" : "Received Applications"}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {/* Applications count is not provided by the API, so we'll keep this as a placeholder */}
                {userType === "student" ? "7" : "18"}
              </div>
              <p className="text-xs text-muted-foreground">
                {userType === "student" ? "+2 since last week" : "+5 since last week"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.total_unread_messages}</div>
              <p className="text-xs text-muted-foreground">
                +{dashboardStats.total_unread_messages_lastweek} since last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{userType === "student" ? "Teachers" : "Students"}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userType === "student" ? dashboardStats.total_teachers : dashboardStats.total_students}
              </div>
              <p className="text-xs text-muted-foreground">
                +
                {userType === "student"
                  ? dashboardStats.total_teachers_lastweek
                  : dashboardStats.total_students_lastweek}{" "}
                since last week
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recent">Recent Activity</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>
                    Your {userType === "student" ? "internship application" : "internship posting"} overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userType === "student" ? (
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <div className="font-medium">Recent Applications</div>
                        <ul className="grid gap-2">
                          {dashboardStats.latest_internship ? (
                            <li className="flex items-center justify-between">
                              <span>
                                {dashboardStats.latest_internship.title} at{" "}
                                {dashboardStats.latest_internship.company_name}
                              </span>
                              <span className="text-sm text-green-500">Available</span>
                            </li>
                          ) : (
                            <li className="flex items-center justify-between">
                              <span>No recent applications</span>
                            </li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <Link href="/dashboard/internships">
                          <Button>Browse More Internships</Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <div className="font-medium">Your Internship Postings</div>
                        <ul className="grid gap-2">
                          {dashboardStats.latest_internship ? (
                            <li className="flex items-center justify-between">
                              <span>{dashboardStats.latest_internship.title}</span>
                              <span className="text-sm text-green-500">
                                {dashboardStats.latest_internship.is_active ? "Active" : "Inactive"}
                              </span>
                            </li>
                          ) : (
                            <li className="flex items-center justify-between">
                              <span>No internships posted yet</span>
                            </li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <Link href="/dashboard/create-internship">
                          <Button>Create New Internship</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="recent" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent actions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <ul className="space-y-4">
                        {recentActivityItems.map((item, index) => (
                          <li key={index} className="flex items-start gap-4">
                            <div className="rounded-full bg-primary/10 p-2">{item.icon}</div>
                            <div className="grid gap-1">
                              <p className="text-sm font-medium">{item.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.description} {item.content}
                              </p>
                              <p className="text-xs text-muted-foreground">{item.time}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Your recent notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <ul className="space-y-4">
                        {/* Message notification */}
                        {dashboardStats.total_unread_messages > 0 && (
                          <li className="flex items-start gap-4">
                            <div className="rounded-full bg-blue-500/10 p-2">
                              <MessageSquare className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="grid gap-1">
                              <p className="text-sm font-medium">
                                New message{dashboardStats.total_unread_messages > 1 ? "s" : ""}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                You have {dashboardStats.total_unread_messages} unread message
                                {dashboardStats.total_unread_messages > 1 ? "s" : ""}
                                {dashboardStats.latest_message && (
                                  <>
                                    . Latest from {dashboardStats.latest_message.sender.first_name}{" "}
                                    {dashboardStats.latest_message.sender.last_name}
                                  </>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {dashboardStats.latest_message
                                  ? formatRelativeTime(dashboardStats.latest_message.sent_at)
                                  : "Just now"}
                              </p>
                            </div>
                          </li>
                        )}

                        {/* Internship notification */}
                        {dashboardStats.latest_internship && (
                          <li className="flex items-start gap-4">
                            <div className="rounded-full bg-green-500/10 p-2">
                              <Briefcase className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="grid gap-1">
                              <p className="text-sm font-medium">
                                {userType === "student" ? "New internship opportunity" : "Your internship posting"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {dashboardStats.latest_internship.title} at{" "}
                                {dashboardStats.latest_internship.company_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatRelativeTime(dashboardStats.latest_internship.created_at)}
                              </p>
                            </div>
                          </li>
                        )}

                        {/* System notification */}
                        <li className="flex items-start gap-4">
                          <div className="rounded-full bg-yellow-500/10 p-2">
                            <Calendar className="h-4 w-4 text-yellow-500" />
                          </div>
                          <div className="grid gap-1">
                            <p className="text-sm font-medium">Upcoming deadlines</p>
                            <p className="text-xs text-muted-foreground">
                              {dashboardStats.latest_internship ? (
                                <>
                                  Deadline for {dashboardStats.latest_internship.title}:{" "}
                                  {new Date(dashboardStats.latest_internship.deadline).toLocaleDateString()}
                                </>
                              ) : (
                                "No upcoming deadlines"
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">Check your calendar</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}