export type TrainingStage = 'MS3' | 'MS4' | 'MS5' | 'FY1' | 'FY2' | 'ST1+' | 'Other'
export type TimeSlot = 'morning' | 'afternoon'
export type SessionType = 'Ward Round' | 'Theatre' | 'Clinic' | 'Lecture' | 'Tutorial' | 'Other'

export interface WeeklySession {
  id: string
  user_id: string
  week_start: string        // ISO date string — Monday of the week
  day_of_week: number       // 1=Mon … 5=Fri
  time_slot: TimeSlot
  start_time: string | null // 'HH:MM', 24h — used to order sessions within a day
  session_name: string | null
  session_type: SessionType | null
  specialty: string | null
  location: string | null
  notes: string | null
  briefing_json: SessionBriefing | null
  created_at: string
}

export interface SessionBriefing {
  brief_summary: string[]
  session_summary: string
  curriculum_objectives: string[]
  conditions_to_expect: { name: string; key_points: string }[]
  clinical_checklist: string[]
  examination_prompts: string[]
  questions_for_patient: string[]
  questions_for_doctor: string[]
  things_to_look_up: string[]
  red_flags: string[]
  reflection_prompts: string[]
  sign_offs_to_chase: { opportunity: string; reason: string }[]
}
export type Curriculum = 'UKMLA' | 'USMLE' | 'AMC' | 'PLAB'
export type CompetencyStatus = 'observed' | 'performed' | 'signed_off'
export type ReflectionFramework = 'STARR' | 'Gibbs'

export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  training_stage: TrainingStage | null
  curriculum: Curriculum | null
  specialty_interests: string[]
  onboarding_complete: boolean
  created_at: string
}

export interface Competency {
  id: string
  curriculum: string
  code: string | null
  name: string
  category: string | null
  description: string | null
}

export interface ClinicalLog {
  id: string
  user_id: string
  specialty: string | null
  presentation: string | null
  procedures_observed: string[]
  procedures_performed: string[]
  learning_points: string | null
  encounter_date: string | null
  case_type: string | null
  role: string | null
  supervisor: string | null
  status: 'draft' | 'complete'
  created_at: string
}

export interface Reflection {
  id: string
  log_id: string
  user_id: string
  framework: ReflectionFramework | null
  raw_ai_output: string | null
  final_text: string | null
  approved_at: string | null
  created_at: string
}

export interface UserCompetencyProgress {
  user_id: string
  competency_id: string
  status: CompetencyStatus
  updated_at: string
}

export interface TimetableEntry {
  id: string
  user_id: string
  specialty: string | null
  start_date: string | null
  end_date: string | null
  notes: string | null
}

export interface SpecialtyRequirement {
  id: string
  specialty: string
  requirement_type: string | null
  requirement_name: string | null
  minimum_count: number | null
}

export interface ExamSyllabus {
  id: string
  exam: string
  topic: string
  subtopic: string | null
  tags: string[]
}

// Minimal Supabase Database type for the client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'> & { created_at?: string }
        Update: Partial<Omit<Profile, 'id'>>
      }
      competencies: {
        Row: Competency
        Insert: Omit<Competency, 'id'>
        Update: Partial<Omit<Competency, 'id'>>
      }
      clinical_logs: {
        Row: ClinicalLog
        Insert: Omit<ClinicalLog, 'id' | 'created_at'> & { created_at?: string }
        Update: Partial<Omit<ClinicalLog, 'id'>>
      }
      reflections: {
        Row: Reflection
        Insert: Omit<Reflection, 'id' | 'created_at'> & { created_at?: string }
        Update: Partial<Omit<Reflection, 'id'>>
      }
      user_competency_progress: {
        Row: UserCompetencyProgress
        Insert: UserCompetencyProgress
        Update: Partial<UserCompetencyProgress>
      }
      timetable_entries: {
        Row: TimetableEntry
        Insert: Omit<TimetableEntry, 'id'>
        Update: Partial<Omit<TimetableEntry, 'id'>>
      }
      specialty_requirements: {
        Row: SpecialtyRequirement
        Insert: Omit<SpecialtyRequirement, 'id'>
        Update: Partial<Omit<SpecialtyRequirement, 'id'>>
      }
      exam_syllabi: {
        Row: ExamSyllabus
        Insert: Omit<ExamSyllabus, 'id'>
        Update: Partial<Omit<ExamSyllabus, 'id'>>
      }
    }
  }
}
