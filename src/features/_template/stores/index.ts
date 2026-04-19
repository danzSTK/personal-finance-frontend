import { create } from 'zustand'
import type { ExampleEntity } from '../types'

interface ExampleState {
  examples: ExampleEntity[]
  selectedExample: ExampleEntity | null
  setExamples: (examples: ExampleEntity[]) => void
  setSelectedExample: (example: ExampleEntity | null) => void
  addExample: (example: ExampleEntity) => void
  updateExample: (id: string, example: ExampleEntity) => void
  removeExample: (id: string) => void
}

export const useExampleStore = create<ExampleState>((set) => ({
  examples: [],
  selectedExample: null,

  setExamples: (examples) => set({ examples }),

  setSelectedExample: (example) => set({ selectedExample: example }),

  addExample: (example) =>
    set((state) => ({ examples: [...state.examples, example] })),

  updateExample: (id, example) =>
    set((state) => ({
      examples: state.examples.map((e) => (e.id === id ? example : e)),
    })),

  removeExample: (id) =>
    set((state) => ({
      examples: state.examples.filter((e) => e.id !== id),
    })),
}))
