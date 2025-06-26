"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Calendar, Users, Plus, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import InternshipService from "@/services/internship-service"

interface Internship {
  id: number
  title: string
  company: string
  location: string
  duration: string
  posted_date: string
  deadline: string
  skills_required: string[]
  description: string
  teacher_id: number
  applicants_count?: number
}

export default function MyInternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setIsLoading(true)
        const data = await InternshipService.getMyInternships()
        setInternships(data)
      } catch (error) {
        console.error("Error fetching internships:", error)
        toast({
          title: "Error",
          description:"Failed to load your internships. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInternships()
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex flex-col p-4 md:p-6 items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading your internships...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Internships</h1>
          <p className="text-muted-foreground">Manage your posted internship opportunities</p>
        </div>
        <Link href="/dashboard/create-internship">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Internship
          </Button>
        </Link>
      </div>

      {internships.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No internships found</h3>
            <p className="text-muted-foreground text-center mb-6">
              You haven&apos;t posted any internships yet. Create your first internship to get started.
            </p>
            <Link href="/dashboard/create-internship">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Internship
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <Card key={internship.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant={internship.location === "Remote" ? "outline" : "secondary"}>
                    {internship.location}
                  </Badge>
                </div>
                <CardTitle className="mt-2">{internship.title}</CardTitle>
                <CardDescription>{internship.company}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {internship.skills_required.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                    {internship.skills_required.length > 3 && (
                      <Badge variant="secondary">+{internship.skills_required.length - 3} more</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Deadline: {new Date(internship.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{internship.applicants_count || 0} Applicants</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/dashboard/my-internships/${internship.id}`}>View Details</Link>
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link href={`/dashboard/applications?internship=${internship.id}`}>View Applications</Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
