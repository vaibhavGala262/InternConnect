"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Search, Filter, Calendar, MapPin, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import InternshipService from "@/services/internship-service"

interface Internship {
  id: number
  title: string
  company: string
  location: string
  duration_weeks: string
  posted_date: string
  deadline: string
  skills_required: string[]
  description: string
  teacher_id: number
  application_link  : string
  
  teacher:{
   
      id: number
      
      first_name:string
      last_name:string
    
      
  }
}

export default function InternshipsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedDuration, setSelectedDuration] = useState<string>("")
  const [internships, setInternships] = useState<Internship[]>([])
  const [filteredInternships, setFilteredInternships] = useState<Internship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()


  useEffect(() => {
    const ids = filteredInternships.map((i) => i.id)
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
    if (duplicates.length > 0) {
      console.warn("Duplicate internship IDs in render:", duplicates)
    }
  }, [filteredInternships])
  // Fetch internships from API
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setIsLoading(true)
        const data = await InternshipService.getInternships({
          limit: 50,
          skip: 0,
        })
        setInternships(data)
        setFilteredInternships(data)
      } catch (error) {
        console.error("Error fetching internships:", error)
        toast({
          title: "Error",
          description: "Failed to load internships. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInternships()
  }, [toast])

  // Filter internships based on search term, skills, and duration
  useEffect(() => {
    const fetchFilteredInternships = async () => {
      try {
        const data = await InternshipService.getInternships({
          limit: 50,
          skip: 0,
          search: searchTerm,
          skills: selectedSkills,
        })
        setFilteredInternships(data)
      } catch (error) {
        console.error("Error fetching filtered internships:", error)
      }
    }
  
    fetchFilteredInternships()
  }, [searchTerm, selectedSkills ,])
  

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  const handleApply = async (internshipId: number ,  applicationLink : string )    => {
    try {
      
      // await InternshipService.enrollInInternship(internshipId)
      // toast({
      //   title: "Application Submitted",
      //   description: "Your application has been submitted successfully!",
      // })
      window.location.href = applicationLink;
    } catch (error) {
      console.error("Error applying for internship:", error)
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Get all unique skills from internships
  const allSkills = Array.from(new Set(internships.flatMap((internship) => internship.skills_required))).sort()

  if (isLoading) {
    return (
      <div className="flex flex-col p-4 md:p-6 items-center justify-center h-[calc(100vh-4rem)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Loading internships...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Available Internships</h1>
          <p className="text-muted-foreground">Browse and apply for internships</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search internships..."
              className="w-full md:w-[300px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Duration </h3>
                <Select onValueChange={setSelectedDuration} value={selectedDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Durations</SelectItem>
                    <SelectItem value="3 months">3 months</SelectItem>
                    <SelectItem value="4 months">4 months</SelectItem>
                    <SelectItem value="6 months">6 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Skills</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {allSkills.map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill}`}
                        checked={selectedSkills.includes(skill)}
                        onCheckedChange={() => handleSkillToggle(skill)}
                      />
                      <Label htmlFor={`skill-${skill}`}>{skill}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedSkills([])
                  setSelectedDuration("")
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Internship Listings */}
        <div className="md:col-span-3 space-y-4">
          {filteredInternships.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No internships found</h3>
                <p className="text-muted-foreground text-center mt-2">
                  Try adjusting your filters or search term to find more opportunities.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredInternships.map((internship) => (
              <Card key={internship.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{internship.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Briefcase className="h-3 w-3" />
                        {internship.company} • Posted by {internship.teacher.first_name}
                      </CardDescription>
                    </div>
                    <Badge variant={internship.location === "Remote" ? "outline" : "secondary"}>
                      {internship.location}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{internship.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {internship.skills_required.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{internship.duration_weeks} weeks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Deadline: {new Date(internship.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{internship.location}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = `/dashboard/internships/${internship.id}`)}
                  >
                    View Details
                  </Button>
                  <Button onClick={() => handleApply(internship.id , internship.application_link)}>Apply Now</Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}


