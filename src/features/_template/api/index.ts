import { api } from '@/shared/config/axios'
import type {
  ExampleEntity,
  CreateExampleDto,
  UpdateExampleDto,
} from '../types'

export const EXAMPLE_API_ENDPOINTS = {
  examples: '/examples',
  byId: (id: string) => `/examples/${id}`,
} as const

export const exampleService = {
  getAll: async (): Promise<ExampleEntity[]> => {
    const response = await api.get<ExampleEntity[]>(
      EXAMPLE_API_ENDPOINTS.examples
    )
    return response.data
  },

  getById: async (id: string): Promise<ExampleEntity> => {
    const response = await api.get<ExampleEntity>(
      EXAMPLE_API_ENDPOINTS.byId(id)
    )
    return response.data
  },

  create: async (data: CreateExampleDto): Promise<ExampleEntity> => {
    const response = await api.post<ExampleEntity>(
      EXAMPLE_API_ENDPOINTS.examples,
      data
    )
    return response.data
  },

  update: async (
    id: string,
    data: UpdateExampleDto
  ): Promise<ExampleEntity> => {
    const response = await api.put<ExampleEntity>(
      EXAMPLE_API_ENDPOINTS.byId(id),
      data
    )
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(EXAMPLE_API_ENDPOINTS.byId(id))
  },
}
