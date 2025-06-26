import apiRequest from "@/lib/api-service"

export interface InternshipCreate {
  title: string
  company: string
  location: string
  duration: string
  deadline: string
  description: string
  skills_required: string[]
  teacher_id?: number
}

export interface InternshipFilter {
  limit?: number
  skip?: number
  search?: string
  skills?: string[]
}

const InternshipService = {
  getInternships: async (filters: InternshipFilter = {}) => {
    const { limit = 10, skip = 0, search = "", skills = [] } = filters

    let queryParams = `?limit=${limit}&skip=${skip}`

    if (search) {
      queryParams += `&search=${encodeURIComponent(search)}`
    }

    if (skills.length > 0) {
      skills.forEach((skill) => {
        queryParams += `&skills=${encodeURIComponent(skill)}`
      })
    }

    return await apiRequest(`/internships/${queryParams}`)
  },

  getInternshipById: async (id: number) => {
    console.log(id)
    return await apiRequest(`/my-internships/${id}`)
  },

  getTeacherInternships: async (teacherId: number) => {
    return await apiRequest(`/internships/${teacherId}`)
  },

  getMyInternships: async () => {
    return await apiRequest("/my_internships")
  },

  createInternship: async (internshipData: InternshipCreate) => {
    return await apiRequest("/internships/", {
      method: "POST",
      body: JSON.stringify(internshipData),
    })
  },

  enrollInInternship: async (internshipId: number) => {
    return await apiRequest("/enroll", {
      method: "POST",
      body: JSON.stringify({ internship_id: internshipId }),
    })
  },

  getEnrolledStudents: async (internshipId: number) => {
    return await apiRequest(`/enrolled_students/${internshipId}`)
  },

  
  downloadEnrolledStudentsExcel :async (internshipId: number): Promise<boolean> => {
  const token = localStorage.getItem("token")

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/download-excel-enrolled-students/${internshipId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to download Excel file")
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `enrolled-students-${internshipId}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  window.URL.revokeObjectURL(url)

  return true
}

,
}

export default InternshipService