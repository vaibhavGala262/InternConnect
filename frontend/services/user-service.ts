import apiRequest from "@/lib/api-service"
import { headers } from "next/headers"
import fetchWithAuthBlob from "@/lib/fetch-blob";

const UserService = {
  getUsers: async () => {
    return await apiRequest("/users/")
  },

  getUserById: async (id: number) => {
    return await apiRequest(`/users/${id}`)
  },

  updateUser: async (id: number, userData: any) => {
    return await apiRequest(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  },

  deleteUser: async (id: number) => {
    return await apiRequest(`/users/${id}`, {
      method: "DELETE",
    })
  },

 uploadProfileImage : async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)

  const token = localStorage.getItem("token")

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/upload-image`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || "Failed to upload image")
  }

  return await response.json()
}
,

  getUserImage: async (userId: number) => {
    const blob = await fetchWithAuthBlob(`/users/get-image/${userId}`);
    return URL.createObjectURL(blob); // this turns blob into usable image URL
  },
}

export default UserService

