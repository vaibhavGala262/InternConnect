import apiRequest from "@/lib/api-service"

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

const ContactService = {
  submitContactForm: async (formData: ContactFormData) => {
    console.log(formData)
    return await apiRequest("/contact-us/", {
      method: "POST",
      body: JSON.stringify(formData),
    })
  },
}

export default ContactService
