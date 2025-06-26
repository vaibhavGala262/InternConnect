import apiRequest from "@/lib/api-service"

export interface LoginCredentials {
  username: string
  password: string
}

export interface UserBase {
  email: string
  password: string
  first_name: string
  last_name: string
  type: string
}

export interface StudentCreate extends UserBase {
  type: "student"
  department: string
  roll_no: string
  graduation_year: number
  gpa: number
}

export interface TeacherCreate extends UserBase {
  type: "teacher"
  department: string
  start_date: string
}

export type RegisterData = StudentCreate | TeacherCreate

const AuthService = {
  login: async (credentials: LoginCredentials) => {
    const formData = new FormData()
    formData.append("username", credentials.username)
    formData.append("password", credentials.password)

    const data = await apiRequest("/login", {
      method: "POST",
      body: formData,
    })

    const token = data.access_token
    if (!token) {
      throw new Error("No token received from server")
    }

    localStorage.setItem("token", token)

    // Decode token to get expiry (optional, for auto-logout or token refresh logic)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      if (payload?.exp) {
        localStorage.setItem("expiry", (payload.exp * 1000).toString())
      }
    } catch (e) {
      console.error("Token decoding failed", e)
    }

    return data
  },

  register: async (userData: RegisterData) => {
    return await apiRequest("/users/", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  getCurrentUser: async () => {
    return await apiRequest("/users/me")
  },

  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userType")
    localStorage.removeItem("expiry")
  },
}

export default AuthService
