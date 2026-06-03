import type { Component } from 'vue'

export type ContracteraPlaceholderInputType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'number'
  | 'email'
  | 'select'
  | 'checkbox'
  | 'rich_text'

export interface ContracteraPlaceholderOption {
  label: string
  value: string | number | boolean
}

export interface ContracteraPlaceholderDefinition {
  key: string
  label: string
  input_type: ContracteraPlaceholderInputType
  required: boolean
  help_text?: string | null
  display_order?: number | null
  input_config?: {
    options?: ContracteraPlaceholderOption[]
    min?: number
    max?: number
    step?: number
    placeholder?: string
    rows?: number
    [key: string]: unknown
  } | null
}

export interface ContracteraValidationError {
  key: string
  message: string
}

export interface ContracteraValidationResult {
  valid: boolean
  errors: ContracteraValidationError[]
  warnings?: string[]
}

export interface ContracteraPreviewResult extends ContracteraValidationResult {
  html: string
}

export interface ContracteraGeneratedDocument {
  generated_document_id: string
  status: string
  status_url: string
  expires_at: string | null
  download_urls: Record<string, string>
}

export interface ContracteraSdkAdapter {
  listPlaceholders: () => Promise<ContracteraPlaceholderDefinition[]>
  updatePlaceholders?: (placeholders: ContracteraPlaceholderDefinition[]) => Promise<ContracteraPlaceholderDefinition[]>
  validatePreview: (values: Record<string, unknown>) => Promise<ContracteraPreviewResult>
  generateDocument: (values: Record<string, unknown>, format?: 'docx' | 'pdf' | 'html') => Promise<ContracteraGeneratedDocument>
}

export type ContracteraMobileMode = 'tab' | 'collapsed' | 'hidden'

export interface ContracteraFieldSlotProps {
  placeholder: ContracteraPlaceholderDefinition
  value: unknown
  error?: string
  update: (value: unknown) => void
}

export interface ContracteraSdkTheme {
  components?: Record<string, Component>
}
