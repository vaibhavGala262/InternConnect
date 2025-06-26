import { toast } from "@/components/ui/use-toast"

export const showToast = {
  success: (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
      duration: 3000,
    })
  },

  error: (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "destructive",
      duration: 5000,
    })
  },

  warning: (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
      duration: 4000,
    })
  },

  info: (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
      duration: 3000,
    })
  },

  loading: (title: string, description?: string) => {
    return toast({
      title,
      description,
      duration: Number.POSITIVE_INFINITY, // Don't auto-dismiss
    })
  },
}
