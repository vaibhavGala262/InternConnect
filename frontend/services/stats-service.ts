import apiRequest from "@/lib/api-service"

// Update the DashboardStats interface to include the new fields from the API
export interface DashboardStats {
  total_internships: number;
  total_interships_lastweek: number;
  latest_internship: {
    id: number;
    title: string;
    company_name: string;
    description: string;
    is_remote: boolean;
    duration_weeks: number;
    created_at: string;
    teacher_id: number;
    application_link: string;
    location: string | null;
    skills_required: string[];
    deadline: string;
    is_active: boolean;
  } | null;
  total_students: number;
  total_students_lastweek: number;
  total_teachers: number;
  total_teachers_lastweek: number;
  total_unread_messages: number;
  total_unread_messages_lastweek: number;
  latest_message: {
    id: number;
    chat_room_id: number;
    sender_id: number;
    content: string;
    is_read: boolean;
    sent_at: string;
    sender: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      type: string;
      created_at: string;
     
    };
  } | null;
}

const StatsService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    return await apiRequest("/stats/");
  },
};

export default StatsService;
