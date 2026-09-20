"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Briefcase, Calendar, Loader2, MessageSquare, User } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import InternshipService from "@/services/internship-service"

type ApplicationStatus = "pending" | "reviewing" | "interview" | "accepted" | "rejected"

interface Application {
  id: number
  enrolled_at: string
  status: ApplicationStatus
  student: {
    first_name: string
    last_name: string
    email: string
  }
  internship: {
    id: number
    title: string
    company_name: string | null
    teacher: {
      first_name: string
      last_name: string
    }
  }
}

const statuses: ApplicationStatus[] = ["pending", "reviewing", "interview", "accepted", "rejected"]

function getStatusBadge(status: ApplicationStatus) {
  switch (status) {
    case "pending":
      return <Badge variant="outline">Pending</Badge>
    case "reviewing":
      return <Badge variant="secondary">Under Review</Badge>
    case "interview":
      return <Badge className="bg-blue-500">Interview</Badge>
    case "accepted":
      return <Badge className="bg-green-500">Accepted</Badge>
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>
  }
}

export default function ApplicationsPage() {
  const [userType, setUserType] = useState<"student" | "teacher" | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const loadApplications = async () => {
    try {
      setIsLoading(true)
      const type = localStorage.getItem("userType") as "student" | "teacher" | null
      setUserType(type)
      const data = type === "teacher"
        ? await InternshipService.getReceivedApplications()
        : await InternshipService.getMyApplications()
      setApplications(data)
    } catch (error) {
      console.error("Error loading applications:", error)
      toast({
        title: "Error",
        description: "Failed to load applications.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [])

  const updateStatus = async (applicationId: number, status: ApplicationStatus) => {
    try {
      const updated = await InternshipService.updateApplicationStatus(applicationId, status)
      setApplications((previous) => previous.map((application) => (
        application.id === applicationId ? { ...application, status: updated.status } : application
      )))
    } catch (error) {
      console.error("Error updating application:", error)
      toast({ title: "Error", description: "Failed to update application status.", variant: "destructive" })
    }
  }

  const withdrawApplication = async (applicationId: number) => {
    try {
      await InternshipService.withdrawApplication(applicationId)
      setApplications((previous) => previous.filter((application) => application.id !== applicationId))
    } catch (error) {
      console.error("Error withdrawing application:", error)
      toast({ title: "Error", description: "Failed to withdraw application.", variant: "destructive" })
    }
  }

  if (isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="flex flex-col p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{userType === "student" ? "My Applications" : "Student Applications"}</h1>
        <p className="text-muted-foreground">
          {userType === "student" ? "Track your real internship applications" : "Review applications for your internships"}
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
          {statuses.map((status) => (
            <TabsTrigger key={status} value={status}>
              {status === "reviewing" ? "Under Review" : status[0].toUpperCase() + status.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ApplicationList applications={applications} userType={userType || "student"} onStatusChange={updateStatus} onWithdraw={withdrawApplication} />
        </TabsContent>
        {statuses.map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            <ApplicationList
              applications={applications.filter((application) => application.status === status)}
              userType={userType || "student"}
              onStatusChange={updateStatus}
              onWithdraw={withdrawApplication}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function ApplicationList({
  applications,
  userType,
  onStatusChange,
  onWithdraw,
}: {
  applications: Application[]
  userType: "student" | "teacher"
  onStatusChange: (applicationId: number, status: ApplicationStatus) => void
  onWithdraw: (applicationId: number) => void
}) {
  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">No applications found</h3>
          <p className="mt-2 text-muted-foreground">
            {userType === "student" ? "Applications you start will appear here." : "Student applications for your internships will appear here."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return applications.map((application) => (
    <ApplicationCard
      key={application.id}
      application={application}
      userType={userType}
      onStatusChange={onStatusChange}
      onWithdraw={onWithdraw}
    />
  ))
}

function ApplicationCard({
  application,
  userType,
  onStatusChange,
  onWithdraw,
}: {
  application: Application
  userType: "student" | "teacher"
  onStatusChange: (applicationId: number, status: ApplicationStatus) => void
  onWithdraw: (applicationId: number) => void
}) {
  const studentName = `${application.student.first_name} ${application.student.last_name}`
  const teacherName = `${application.internship.teacher.first_name} ${application.internship.teacher.last_name}`

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{application.internship.title}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {application.internship.company_name || "Company not specified"}
            </CardDescription>
          </div>
          {getStatusBadge(application.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{userType === "student" ? `Posted by: ${teacherName}` : `Student: ${studentName}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Applied on: {new Date(application.enrolled_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {userType === "student" ? (
            <>
              <Link href={`/dashboard/internships/${application.internship.id}`}>
                <Button variant="outline" size="sm">View Internship</Button>
              </Link>
              <Link href="/dashboard/messages">
                <Button variant="outline" size="sm"><MessageSquare className="mr-2 h-4 w-4" />Message Teacher</Button>
              </Link>
              {application.status === "pending" && (
                <Button variant="outline" size="sm" className="text-red-500" onClick={() => onWithdraw(application.id)}>
                  Withdraw Application
                </Button>
              )}
            </>
          ) : (
            <>
              <Link href="/dashboard/messages">
                <Button variant="outline" size="sm"><MessageSquare className="mr-2 h-4 w-4" />Message Student</Button>
              </Link>
              {application.status === "pending" && <Button size="sm" variant="outline" onClick={() => onStatusChange(application.id, "reviewing")}>Mark as Reviewing</Button>}
              {application.status === "reviewing" && <Button size="sm" variant="outline" onClick={() => onStatusChange(application.id, "interview")}>Schedule Interview</Button>}
              {application.status === "interview" && (
                <>
                  <Button size="sm" className="bg-green-600" onClick={() => onStatusChange(application.id, "accepted")}>Accept</Button>
                  <Button size="sm" variant="destructive" onClick={() => onStatusChange(application.id, "rejected")}>Reject</Button>
                </>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
