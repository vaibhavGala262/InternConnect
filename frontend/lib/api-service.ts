import { toast } from "@/components/ui/use-toast";

const API_BASE_URL =process.env.NEXT_PUBLIC_API_URL;

// Helper function to handle API errors
const handleApiError = (error: any) => {
  console.error("API Error:", error);
  const errorMessage = error.response?.data?.detail || "An error occurred. Please try again.";
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive",
  });
  throw error;
};

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  console.log(endpoint)
  // If body is FormData, skip setting Content-Type (browser will handle it)
  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend validation error:", errorData);
      throw { 
        status: response.status,
        data: errorData 
      };
    }

    return await response.json();
  } catch (error) {
    console.error("API Request Failed:", error);
    throw error;
  }
};

export default apiRequest;
