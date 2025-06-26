"use client"
import { useState, useEffect } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Briefcase,
  Calendar,
  MapPin,
  Clock,
  Users,
  GraduationCap,
  Mail,
  BookOpen,
  Search,
  ArrowLeft,
  Loader2,
  MessageSquare,
  Download,
  FileText,
  FileDown,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import InternshipService from "@/services/internship-service"


interface EnrolledStudent {
  id: number
  enrolled_at: string
  student: Student
  internship: Internship
}


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
  teacher_name: string
}

interface Student {
  id: number
  sap_id: number
  email: string
  first_name: string
  last_name: string
  department: string
  roll_no: string
  graduation_year: number
  gpa: number
  created_at: string
  enrolled_at: string
}

export default function InternshipDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [internship, setInternship] = useState<Internship | null>(null)
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([])
  const [filteredStudents, setFilteredStudents] = useState<EnrolledStudent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [userType, setUserType] = useState<"student" | "teacher" | null>(null)
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false)

  const internshipId = pathname ? Number.parseInt(pathname.split("/").pop() || "0") : 0

  useEffect(() => {
    // Get user type from local storage
    const storedUserType = localStorage.getItem("userType") as "student" | "teacher" | null
    setUserType(storedUserType)

    // If user is not a teacher, redirect to dashboard
    if (storedUserType !== "teacher") {
      toast({
        title: "Access denied",
        description: "Only teachers can view enrolled students.",
        variant: "destructive",
      })
      router.push("/dashboard")
      return
    }

    const internshipId = Number(params.id)
    console.log(internshipId)

    const fetchInternshipDetails = async () => {
      try {
        setIsLoading(true)

        // Fetch internship details
        const internshipData = await InternshipService.getInternshipById(internshipId)
        setInternship(internshipData)

        // Fetch enrolled students
        const studentsData = await InternshipService.getEnrolledStudents(internshipId)
        setEnrolledStudents(studentsData)
        setFilteredStudents(studentsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load internship details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInternshipDetails()
  }, [params.id, router, toast])

  // Filter and sort students
  useEffect(() => {
    if (!enrolledStudents.length) return

    let filtered = [...enrolledStudents]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.student.roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.student.department.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply sorting
    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => `${a.student.first_name} ${a.student.last_name}`.localeCompare(`${b.student.first_name} ${b.student.last_name}`))
        break
      case "gpa-high":
        filtered.sort((a, b) => b.student.gpa - a.student.gpa)
        break
      case "gpa-low":
        filtered.sort((a, b) => a.student.gpa - b.student.gpa)
        break
      case "recent":
        filtered.sort((a, b) => new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.enrolled_at).getTime() - new Date(b.enrolled_at).getTime())
        break
      default:
        break
    }

    setFilteredStudents(filtered)
  }, [enrolledStudents, searchTerm, sortBy])

  const handleContactStudent = (studentId: number) => {
    // Navigate to messages page or open chat with this student
    router.push(`/dashboard/messages?student=${studentId}`)
  }

  const handleDownloadResume = (studentId: number) => {
    toast({
      title: "Resume download",
      description: "Student resume download started.",
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading internship details...</p>
      </div>
    )
  }

  if (!internship) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <p className="text-muted-foreground">Internship not found or you don't have permission to view it.</p>
        <Button className="mt-4" onClick={() => router.push("/dashboard/my-internships")}>
          Back to My Internships
        </Button>
      </div>
    )
  }

  const handleDownloadExcel = async () => {
    try {
      setIsDownloadingExcel(true)
      await InternshipService.downloadEnrolledStudentsExcel(internshipId)
      toast({
        title: "Success",
        description: "Excel file downloaded successfully.",
      })
    } catch (error) {
      console.error("Error downloading Excel:", error)
      toast({
        title: "Error",
        description: "Failed to download Excel file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloadingExcel(false)
    }
  }

  return (
    <div className="flex flex-col p-4 md:p-6">
      <Button
        variant="ghost"
        className="w-fit mb-6 flex items-center gap-2"
        onClick={() => router.push("/dashboard/my-internships")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Internships
      </Button>

      {/* Internship Details Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{internship.title}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Briefcase className="h-4 w-4" />
                {internship.company}
              </CardDescription>
            </div>
            <Badge variant={internship.location === "Remote" ? "outline" : "secondary"} className="w-fit">
              {internship.location}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="font-medium">Duration:</span> {internship.duration}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="font-medium">Deadline:</span> {new Date(internship.deadline).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="font-medium">Location:</span> {internship.location}
              </span>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{internship.description}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {internship.skills_required.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Students Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Enrolled Students</h2>
        <p className="text-muted-foreground">
          {enrolledStudents.length} student{enrolledStudents.length !== 1 ? "s" : ""} enrolled in this internship
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search students by name, email, or roll number..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="gpa-high">GPA (High to Low)</SelectItem>
              <SelectItem value="gpa-low">GPA (Low to High)</SelectItem>
              <SelectItem value="recent">Recently Enrolled</SelectItem>
              <SelectItem value="oldest">Oldest Enrolled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Students Grid */}
      <Tabs defaultValue="grid" className="w-full">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadExcel}
          disabled={isDownloadingExcel || filteredStudents.length === 0}
          className="flex items-center gap-2"
        >
          {isDownloadingExcel ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          Download Excel
        </Button>
      </div>
     
        <TabsContent value="grid">
          {filteredStudents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No students found</h3>
                <p className="text-muted-foreground text-center mt-2">
                  {searchTerm
                    ? "Try adjusting your search term to find students."
                    : "No students have enrolled in this internship yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((entry) => (
                <Card key={entry.student.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/placeholder.svg" alt={`${entry.student.first_name} ${entry.student.last_name}`} />
                          <AvatarFallback>
                            {entry.student.first_name}
                            {entry.student.last_name}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {entry.student.first_name} {entry.student.last_name}
                          </CardTitle>
                          <CardDescription>{entry.student.department}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {entry.student.gpa.toFixed(2)} GPA
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{entry.student.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>Roll No: {entry.student.roll_no}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span>Graduation: {entry.student.graduation_year}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Enrolled: {new Date(entry.enrolled_at.replace(/\.(\d{3})\d*/, '.$1')).toString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleContactStudent(entry.student.sap_id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownloadResume(entry.student.sap_id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list">
          {filteredStudents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No students found</h3>
                <p className="text-muted-foreground text-center mt-2">
                  {searchTerm
                    ? "Try adjusting your search term to find students."
                    : "No students have enrolled in this internship yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((entry) => (
                <Card key={entry.student.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="/placeholder.svg" alt={`${entry.student.first_name} ${entry.student.last_name}`} />
                          <AvatarFallback>
                            {entry.student.first_name[0]}
                            {entry.student.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {entry.student.first_name} {entry.student.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{entry.student.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Department</p>
                          <p className="text-muted-foreground">{entry.student.department}</p>
                        </div>
                        <div>
                          <p className="font-medium">Roll No</p>
                          <p className="text-muted-foreground">{entry.student.roll_no}</p>
                        </div>
                        <div>
                          <p className="font-medium">GPA</p>
                          <p className="text-muted-foreground">{entry.student.gpa.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="font-medium">Graduation</p>
                          <p className="text-muted-foreground">{entry.student.graduation_year}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleContactStudent(entry.student.sap_id)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadResume(entry.student.sap_id)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}