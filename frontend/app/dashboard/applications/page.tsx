"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Briefcase, Calendar, MessageSquare, User } from "lucide-react"
import Link from "next/link"

interface Application {
  id: number
  internshipId: number
  internshipTitle: string
  company: string
  teacherName: string
  teacherId: number
  appliedDate: string
  status: "pending" | "reviewing" | "interview" | "accepted" | "rejected"
}

const getStatusBadge = (status: Application["status"]) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline">Pending</Badge>
    case "reviewing":
      return <Badge variant="secondary">Under Review</Badge>
    case "interview":
      return (
        <Badge variant="default" className="bg-blue-500">
          Interview
        </Badge>
      )
    case "accepted":
      return (
        <Badge variant="default" className="bg-green-500">
          Accepted
        </Badge>
      )
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export default function ApplicationsPage() {
  const [userType, setUserType] = useState<"student" | "teacher" | null>(null)
  const [applications, setApplications] = useState<Application[]>([])

  useEffect(() => {
    // In a real app, you would fetch user data from your API
    const storedUserType = localStorage.getItem("userType") as "student" | "teacher" | null
    setUserType(storedUserType)

    // Mock applications data
    const mockApplications: Application[] = [
      {
        id: 1,
        internshipId: 1,
        internshipTitle: "Full Stack Developer Intern",
        company: "Tech Solutions Inc.",
        teacherName: "Dr. Sarah Williams",
        teacherId: 1,
        appliedDate: "2024-04-12",
        status: "pending",
      },
      {
        id: 2,
        internshipId: 2,
        internshipTitle: "Machine Learning Research Assistant",
        company: "AI Research Lab",
        teacherName: "Dr. Michael Chen",
        teacherId: 2,
        appliedDate: "2024-04-10",
        status: "reviewing",
      },
      {
        id: 3,
        internshipId: 4,
        internshipTitle: "Data Science Intern",
        company: "Analytics Co.",
        teacherName: "Dr. Robert Johnson",
        teacherId: 4,
        appliedDate: "2024-04-05",
        status: "interview",
      },
      {
        id: 4,
        internshipId: 5,
        internshipTitle: "Mobile App Developer",
        company: "AppWorks",
        teacherName: "Prof. David Miller",
        teacherId: 5,
        appliedDate: "2024-04-01",
        status: "accepted",
      },
      {
        id: 5,
        internshipId: 6,
        internshipTitle: "Cybersecurity Intern",
        company: "SecureTech",
        teacherName: "Dr. Emily Wilson",
        teacherId: 6,
        appliedDate: "2024-03-25",
        status: "rejected",
      },
    ]

    setApplications(mockApplications)
  }, [])

  return (
    <div className="flex flex-col p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{userType === "student" ? "My Applications" : "Student Applications"}</h1>
        <p className="text-muted-foreground">
          {userType === "student"
            ? "Track the status of your internship applications"
            : "Review and manage student applications for your internships"}
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="reviewing">Under Review</TabsTrigger>
          <TabsTrigger value="interview">Interview</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {applications.map((application) => (
            <ApplicationCard key={application.id} application={application} userType={userType || "student"} />
          ))}
        </TabsContent>

        {["pending", "reviewing", "interview", "accepted", "rejected"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {applications
              .filter((app) => app.status === status)
              .map((application) => (
                <ApplicationCard key={application.id} application={application} userType={userType || "student"} />
              ))}

            {applications.filter((app) => app.status === status).length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No applications found</h3>
                  <p className="text-muted-foreground text-center mt-2">
                    {userType === "student"
                      ? `You don't have any ${status} applications.`
                      : `You don't have any ${status} applications from students.`}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function ApplicationCard({
  application,
  userType,
}: {
  application: Application
  userType: "student" | "teacher"
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{application.internshipTitle}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Briefcase className="h-3 w-3" />
              {application.company}
            </CardDescription>
          </div>
          {getStatusBadge(application.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {userType === "student" ? `Posted by: ${application.teacherName}` : "Student: Alex Johnson"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Applied on: {new Date(application.appliedDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {userType === "student" ? (
            <>
              <Link href={`/dashboard/internships/${application.internshipId}`}>
                <Button variant="outline" size="sm">
                  View Internship
                </Button>
              </Link>
              <Link href={`/dashboard/messages`}>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Teacher
                </Button>
              </Link>
              {application.status === "pending" && (
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                  Withdraw Application
                </Button>
              )}
            </>
          ) : (
            <>
              <Link href={`/dashboard/applications/${application.id}`}>
                <Button variant="outline" size="sm">
                  Review Application
                </Button>
              </Link>
              <Link href={`/dashboard/messages`}>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Student
                </Button>
              </Link>
              {application.status === "pending" && (
                <Button variant="outline" size="sm" className="text-blue-500 hover:text-blue-700">
                  Mark as Reviewing
                </Button>
              )}
              {application.status === "reviewing" && (
                <Button variant="outline" size="sm" className="text-blue-500 hover:text-blue-700">
                  Schedule Interview
                </Button>
              )}
              {application.status === "interview" && (
                <>
                  <Button variant="outline" size="sm" className="text-green-500 hover:text-green-700">
                    Accept
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                    Reject
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
