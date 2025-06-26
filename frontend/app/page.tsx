import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, GraduationCap, Users } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-6 w-6" />
            <span>InternConnect</span>
          </div>
          <div className="flex items-center gap-4 ml-auto mr-4">
  <Link href="/login">
    <Button variant="ghost">Login</Button>
  </Link>
  <Link href="/register">
    <Button>Register</Button>
  </Link>
</div>


        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Connect Students with Opportunities
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Our platform bridges the gap between students and teachers, making internship management seamless
                    and efficient.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button size="lg" className="gap-1.5">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-[350px] rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1">
                  <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-950 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                        <GraduationCap className="h-10 w-10 text-purple-500 mb-2" />
                        <span className="text-sm font-medium">Students</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                        <Users className="h-10 w-10 text-pink-500 mb-2" />
                        <span className="text-sm font-medium">Teachers</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100 dark:bg-gray-800 col-span-2">
                        <BookOpen className="h-10 w-10 text-teal-500 mb-2" />
                        <span className="text-sm font-medium">Internships</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Features</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our platform offers a comprehensive set of features to streamline internship management.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500 text-white">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Internship Listings</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Browse and search through a wide range of internship opportunities.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Real-time Chat</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Communicate directly with teachers or students through our integrated chat system.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500 text-white">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Easy Enrollment</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Apply to internships with a single click and track your application status.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
