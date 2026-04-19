// Example types for a feature
export interface ExampleEntity {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface CreateExampleDto {
  name: string
  description: string
}

export interface UpdateExampleDto {
  name?: string
  description?: string
}
