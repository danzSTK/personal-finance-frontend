import { api } from '@/shared/config/axios'
import type {
  ExampleEntity,
  CreateExampleDto,
  UpdateExampleDto,
} from '../types'

export const exampleService = {
  getAll: async (): Promise<ExampleEntity[]> => {
    const response = await api.get<ExampleEntity[]>('/examples')
    return response.data
  },

  getById: async (id: string): Promise<ExampleEntity> => {
    const response = await api.get<ExampleEntity>(`/examples/${id}`)
    return response.data
  },

  create: async (data: CreateExampleDto): Promise<ExampleEntity> => {
    const response = await api.post<ExampleEntity>('/examples', data)
    return response.data
  },

  update: async (
    id: string,
    data: UpdateExampleDto
  ): Promise<ExampleEntity> => {
    const response = await api.put<ExampleEntity>(`/examples/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/examples/${id}`)
  },
}
