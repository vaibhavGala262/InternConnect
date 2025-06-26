"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Loader2 } from "lucide-react"
import InternshipService, { type InternshipCreate } from "@/services/internship-service"
import AuthService from "@/services/auth-service"
import { Checkbox } from "@/components/ui/checkbox"

export default function CreateInternshipPage() {
  const [formData, setFormData] = useState({
    title: "",
    company_name: "",
    is_remote: false,
    duration_weeks: "",
    deadline: "",
    description: "",
    application_link: "",
  })
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [teacherId, setTeacherId] = useState<number | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Get current user info to get teacher ID
    const fetchUserInfo = async () => {
      try {
        const userInfo = await AuthService.getCurrentUser()
        if (userInfo.type !== "teacher") {
          toast({
            title: "Access denied",
            description: "Only teachers can create internships.",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }
        setTeacherId(userInfo.teacher_id)
      } catch (error) {
        console.error("Error fetching user info:", error)
        toast({
          title: "Error",
          description: "Failed to load user information. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchUserInfo()
  }, [router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_remote: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills((prev) => [...prev, newSkill])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((skill) => skill !== skillToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.title ||
      !formData.description ||
      !formData.application_link
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields (title, description, and application link).",
        variant: "destructive",
      })
      return
    }

    if (!teacherId) {
      toast({
        title: "Error",
        description: "Teacher ID not found. Please try again.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const internshipData: InternshipCreate = {
        title: formData.title,
        company_name: formData.company_name || undefined,
        is_remote: formData.is_remote,
        duration_weeks: formData.duration_weeks ? parseInt(formData.duration_weeks) : undefined,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined,
        description: formData.description,
        application_link: formData.application_link,
        skills_required: skills.length > 0 ? skills : undefined,
        teacher_id: teacherId,
        is_active: true // default value as per your model
      }

      await InternshipService.createInternship(internshipData)

      toast({
        title: "Internship created",
        description: "Your internship has been posted successfully.",
      })

      router.push("/dashboard/my-internships")
    } catch (error) {
      console.error("Error creating internship:", error)
      toast({
        title: "Error",
        description: "There was an error creating the internship. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Internship</h1>
        <p className="text-muted-foreground">Post a new internship opportunity for students</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Internship Details</CardTitle>
            <CardDescription>Fill in the details about the internship opportunity you want to post.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Internship Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Full Stack Developer Intern"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name">Company/Lab Name</Label>
              <Input
                id="company_name"
                name="company_name"
                placeholder="e.g., Tech Solutions Inc."
                value={formData.company_name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="application_link">Application Link *</Label>
              <Input
                id="application_link"
                name="application_link"
                placeholder="https://example.com/apply"
                value={formData.application_link}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is_remote" 
                  checked={formData.is_remote}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="is_remote">Remote position</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_weeks">Duration (weeks)</Label>
                <Input
                  id="duration_weeks"
                  name="duration_weeks"
                  type="number"
                  placeholder="e.g., 12"
                  value={formData.duration_weeks}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Application Deadline</Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the internship, responsibilities, and requirements..."
                rows={5}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Required Skills</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-1"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {skill}</span>
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill (e.g., JavaScript, Python)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSkill()
                    }
                  }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Internship"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}