import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export type OnboardingStep =
  | 'welcome'           // Welcome screen - collect car model & nickname
  | 'creating'          // Creating workspace
  | 'problems'          // Collecting vehicle problems
  | 'complete'          // Onboarding complete

export interface VehicleProblem {
  id: string
  description: string
  componentIds: string[]  // Component IDs in the scene to mark as faulty
  severity: 'critical' | 'important' | 'minor'
}

interface OnboardingState {
  // Current state
  isOnboarding: boolean
  currentStep: OnboardingStep

  // Vehicle info
  carModel: string | null
  projectNickname: string | null
  workspaceId: string | null

  // Problems collected
  problems: VehicleProblem[]

  // Animation state
  showWorkspaceAnimation: boolean

  // Actions
  startOnboarding: () => void
  completeWelcome: (carModel: string, nickname: string) => void
  startProblemsCollection: (workspaceId: string) => void
  addProblem: (problem: VehicleProblem) => void
  removeProblem: (problemId: string) => void
  completeOnboarding: () => void
  resetOnboarding: () => void
  setShowWorkspaceAnimation: (show: boolean) => void
}

export const useOnboardingStore = create<OnboardingState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isOnboarding: false,
    currentStep: 'welcome',
    carModel: null,
    projectNickname: null,
    workspaceId: null,
    problems: [],
    showWorkspaceAnimation: false,

    // Start the onboarding process
    startOnboarding: () => {
      set({
        isOnboarding: true,
        currentStep: 'welcome',
        carModel: null,
        projectNickname: null,
        workspaceId: null,
        problems: [],
        showWorkspaceAnimation: false
      })
    },

    // Complete welcome step and move to workspace creation
    completeWelcome: (carModel, nickname) => {
      set({
        carModel,
        projectNickname: nickname,
        currentStep: 'creating',
        showWorkspaceAnimation: true
      })
    },

    // Start collecting problems (after workspace is created)
    startProblemsCollection: (workspaceId) => {
      set({
        workspaceId,
        currentStep: 'problems',
        showWorkspaceAnimation: false
      })
    },

    // Add a problem and tag components as faulty
    addProblem: (problem) => {
      set((state) => ({
        problems: [...state.problems, problem]
      }))
    },

    // Remove a problem
    removeProblem: (problemId) => {
      set((state) => ({
        problems: state.problems.filter(p => p.id !== problemId)
      }))
    },

    // Complete onboarding
    completeOnboarding: () => {
      set({
        isOnboarding: false,
        currentStep: 'complete'
      })
    },

    // Reset onboarding (for testing or restart)
    resetOnboarding: () => {
      set({
        isOnboarding: false,
        currentStep: 'welcome',
        carModel: null,
        projectNickname: null,
        workspaceId: null,
        problems: [],
        showWorkspaceAnimation: false
      })
    },

    // Set workspace animation visibility
    setShowWorkspaceAnimation: (show) => {
      set({ showWorkspaceAnimation: show })
    }
  }))
)
