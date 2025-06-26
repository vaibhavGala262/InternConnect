import AuthService from "@/services/auth-service"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

let logoutTimer: NodeJS.Timeout

export function setupAutoLogout(router: ReturnType<typeof useRouter>) {
  clearTimeout(logoutTimer)

  const expiry = localStorage.getItem("expiry")
  if (!expiry) return

  const timeout = Number(expiry) - Date.now()

  if (timeout > 0) {
    logoutTimer = setTimeout(() => {
      AuthService.logout()
      toast({
        title: "Session expired",
        description: "Please login again.",
        variant: "destructive",
      })

      router.push("/login")
    }, timeout)
  } else {
   
    AuthService.logout()
    router.push("/login")
  }
}
