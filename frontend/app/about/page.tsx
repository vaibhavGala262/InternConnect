import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SiteFooter } from "@/components/site-footer"
import { BookOpen, Users, GraduationCap, MessageSquare, Briefcase, Shield, ArrowRight, CheckCircle } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-6 w-6" />
            <span>InternConnect</span>
          </Link>
          <div className="flex items-center gap-4">
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
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Bridging Students with Opportunities
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  InternConnect is a platform designed to connect students with teachers and internship opportunities,
                  making the process seamless and efficient.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button size="lg" className="gap-1.5">
                    Join Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact-us">
                  <Button size="lg" variant="outline">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Our Mission</div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                    Empowering the Next Generation of Professionals
                  </h2>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    We believe that every student deserves access to quality internship opportunities that align with
                    their career goals and academic interests. Our platform is built to make this process transparent,
                    efficient, and accessible.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="font-medium">Connecting students with experienced mentors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="font-medium">Streamlining the internship application process</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="font-medium">Fostering communication between students and teachers</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[400px] w-full overflow-hidden rounded-xl">
                  <Image
                    src="https://cdn.dribbble.com/userupload/21255756/file/original-57db72510c8c81b3009f328d5c93c4c7.gif"
                    alt="Students collaborating"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Features</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Everything You Need in One Platform</h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  InternConnect offers a comprehensive set of features designed to make internship management simple and
                  effective.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-white dark:bg-gray-900 border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Briefcase className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Internship Listings</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Browse and search through a wide range of internship opportunities tailored to your interests and
                      skills.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-900 border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Real-time Chat</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Communicate directly with teachers or students through our integrated real-time chat system.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-900 border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Easy Application</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Apply to internships with a single click and track your application status in real-time.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-900 border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Teacher-Student Connection</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Build meaningful connections with teachers who can guide you through your professional journey.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-900 border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Comprehensive Dashboard</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Access all your applications, messages, and internship opportunities from a single, intuitive
                      dashboard.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-900 border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Secure Platform</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Your data is protected with industry-standard security measures, ensuring your information remains
                      private.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">FAQ</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Frequently Asked Questions</h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Find answers to common questions about InternConnect.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-bold">How do I create an account?</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    You can create an account by clicking on the "Register" button in the top right corner of the page.
                    Fill in your details, select your account type (student or teacher), and you're good to go!
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-bold">Is InternConnect free to use?</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Yes, InternConnect is completely free for both students and teachers. We believe in providing equal
                    access to opportunities for all.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-bold">How do I apply for an internship?</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Once you've created a student account, you can browse available internships and apply with a single
                    click. You can track the status of your applications from your dashboard.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-bold">How do I post an internship as a teacher?</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    After creating a teacher account, you can post internship opportunities by navigating to the "Create
                    Internship" section in your dashboard. Fill in the details, and your posting will be live!
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-bold">Can I message teachers directly?</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Yes, our platform features a real-time chat system that allows students to communicate directly with
                    teachers and vice versa.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-bold">How can I get help if I have issues?</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    You can reach out to our support team through the Contact Us page, or use the chatbot feature for
                    immediate assistance with common questions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Get Started?</h2>
                <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl/relaxed">
                  Join thousands of students and teachers already using InternConnect to find and post internship
                  opportunities.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="gap-1.5">
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact-us">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
