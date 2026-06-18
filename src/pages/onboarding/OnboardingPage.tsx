import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { TrainingStage, Curriculum } from '../../lib/types'

const TRAINING_STAGES: { value: TrainingStage; label: string }[] = [
  { value: 'MS3', label: 'Year 3 Medical Student' },
  { value: 'MS4', label: 'Year 4 Medical Student' },
  { value: 'MS5', label: 'Year 5 Medical Student' },
  { value: 'FY1', label: 'Foundation Year 1' },
  { value: 'FY2', label: 'Foundation Year 2' },
  { value: 'ST1+', label: 'Specialty Trainee (ST1+)' },
  { value: 'Other', label: 'Other' },
]

const CURRICULA: { value: Curriculum; label: string; description: string }[] = [
  { value: 'UKMLA', label: 'UKMLA', description: 'UK Medical Licensing Assessment' },
  { value: 'USMLE', label: 'USMLE', description: 'US Medical Licensing Examination' },
  { value: 'AMC', label: 'AMC', description: 'Australian Medical Council' },
  { value: 'PLAB', label: 'PLAB', description: 'Professional & Linguistic Assessments Board' },
]

const SPECIALTIES = [
  'General Medicine', 'Surgery', 'Paediatrics', 'Psychiatry', 'General Practice',
  'Emergency Medicine', 'Obstetrics & Gynaecology', 'Anaesthetics', 'Radiology',
  'Cardiology', 'Neurology', 'Orthopaedics', 'Oncology', 'Dermatology', 'ENT',
]

export function OnboardingPage() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [trainingStage, setTrainingStage] = useState<TrainingStage | null>(null)
  const [curriculum, setCurriculum] = useState<Curriculum>('UKMLA')
  const [specialtyInterests, setSpecialtyInterests] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleSpecialty(s: string) {
    setSpecialtyInterests(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  async function handleComplete() {
    if (!user) return
    setSaving(true)
    setError(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('profiles') as any).upsert({
      id: user.id,
      training_stage: trainingStage,
      curriculum,
      specialty_interests: specialtyInterests,
      onboarding_complete: true,
    })
    setSaving(false)
    if (error) {
      setError(error.message)
    } else {
      await refreshProfile()
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(n => (
            <div
              key={n}
              className={`h-1.5 flex-1 rounded-full transition-colors ${n <= step ? 'bg-brand-500' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold mb-1">What stage are you at?</h2>
              <p className="text-gray-500 text-sm mb-6">We'll tailor your portfolio to your level.</p>
              <div className="space-y-2">
                {TRAINING_STAGES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setTrainingStage(value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors text-sm font-medium ${
                      trainingStage === value
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                disabled={!trainingStage}
                onClick={() => setStep(2)}
                className="mt-6 w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-medium rounded-xl transition-colors"
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold mb-1">Which curriculum are you following?</h2>
              <p className="text-gray-500 text-sm mb-6">This determines how we tag your cases and track progress.</p>
              <div className="space-y-2">
                {CURRICULA.map(({ value, label, description }) => (
                  <button
                    key={value}
                    onClick={() => setCurriculum(value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                      curriculum === value
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium text-sm">{label}</span>
                    <span className="text-gray-400 text-xs ml-2">{description}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-colors"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-semibold mb-1">Which specialties interest you?</h2>
              <p className="text-gray-500 text-sm mb-6">
                Select any you're considering — we'll track portfolio requirements for them.
              </p>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSpecialty(s)}
                    className={`px-3 py-1.5 rounded-full text-sm border-2 font-medium transition-colors ${
                      specialtyInterests.includes(s)
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {error && (
                <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  disabled={saving}
                  onClick={handleComplete}
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
                >
                  {saving ? 'Saving…' : 'Get started'}
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">You can change these later in settings.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
