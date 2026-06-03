<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type {
  ContracteraGeneratedDocument,
  ContracteraMobileMode,
  ContracteraPlaceholderDefinition,
  ContracteraSdkAdapter
} from '../types'

const props = withDefaults(defineProps<{
  adapter: ContracteraSdkAdapter
  title?: string
  generateFormat?: 'docx' | 'pdf' | 'html'
  debounceMs?: number
  mobileMode?: ContracteraMobileMode
}>(), {
  title: 'Genereaza contract',
  generateFormat: 'docx',
  debounceMs: 350,
  mobileMode: 'tab'
})

const emit = defineEmits<{
  generated: [document: ContracteraGeneratedDocument]
  error: [error: unknown]
}>()

const placeholders = ref<ContracteraPlaceholderDefinition[]>([])
const values = ref<Record<string, unknown>>({})
const localErrors = ref<Record<string, string>>({})
const backendErrors = ref<Record<string, string>>({})
const previewHtml = ref('')
const warnings = ref<string[]>([])
const activePane = ref<'form' | 'preview'>('form')
const loading = ref(true)
const previewLoading = ref(false)
const generating = ref(false)
const backendValidationOk = ref(false)
const errorMessage = ref('')
let previewTimer: ReturnType<typeof setTimeout> | null = null

const sortedPlaceholders = computed(() => [...placeholders.value].sort((left, right) => {
  return (left.display_order ?? 0) - (right.display_order ?? 0)
}))

function initialValueFor(placeholder: ContracteraPlaceholderDefinition): unknown {
  return placeholder.input_type === 'checkbox' ? false : ''
}

function errorFor(key: string): string {
  return localErrors.value[key] ?? backendErrors.value[key] ?? ''
}

function optionValue(placeholder: ContracteraPlaceholderDefinition, rawValue: string): string | number | boolean {
  const option = placeholder.input_config?.options?.find((candidate) => String(candidate.value) === rawValue)

  return option?.value ?? rawValue
}

function updateValue(placeholder: ContracteraPlaceholderDefinition, rawValue: unknown): void {
  if (placeholder.input_type === 'checkbox') {
    values.value[placeholder.key] = Boolean(rawValue)
  } else if (placeholder.input_type === 'select') {
    values.value[placeholder.key] = optionValue(placeholder, String(rawValue))
  } else {
    values.value[placeholder.key] = rawValue
  }

  backendValidationOk.value = false
  validateLocal()
  schedulePreview()
}

function normalizeValuesForGenerate(): Record<string, unknown> {
  const normalized: Record<string, unknown> = {}

  for (const placeholder of placeholders.value) {
    const value = values.value[placeholder.key]

    if (placeholder.input_type === 'number' && value !== '' && value !== null && value !== undefined) {
      normalized[placeholder.key] = Number(value)
    } else {
      normalized[placeholder.key] = value
    }
  }

  return normalized
}

function validateLocal(requireRequiredFields = true): boolean {
  const nextErrors: Record<string, string> = {}

  for (const placeholder of placeholders.value) {
    const value = values.value[placeholder.key]

    if (requireRequiredFields && placeholder.required && (value === '' || value === null || value === undefined || value === false)) {
      nextErrors[placeholder.key] = 'Camp obligatoriu'
      continue
    }

    if (placeholder.input_type === 'number' && value !== '' && Number.isNaN(Number(value))) {
      nextErrors[placeholder.key] = 'Valoare numerica invalida'
      continue
    }

    if (placeholder.input_type === 'select' && value !== '' && placeholder.input_config?.options?.length) {
      const allowed = placeholder.input_config.options.some((option) => option.value === value)

      if (!allowed) {
        nextErrors[placeholder.key] = 'Optiune invalida'
      }
    }
  }

  localErrors.value = nextErrors

  return Object.keys(nextErrors).length === 0
}

async function runValidatePreview(): Promise<boolean> {
  if (!validateLocal(false)) {
    return false
  }

  previewLoading.value = true
  backendErrors.value = {}
  errorMessage.value = ''

  try {
    const result = await props.adapter.validatePreview({ ...values.value })
    backendErrors.value = Object.fromEntries(result.errors.map((error) => [error.key, error.message]))
    previewHtml.value = result.html
    warnings.value = result.warnings ?? []
    backendValidationOk.value = result.valid

    return result.valid
  } catch (error) {
    errorMessage.value = 'Nu am putut valida datele contractului.'
    backendValidationOk.value = false
    emit('error', error)

    return false
  } finally {
    previewLoading.value = false
  }
}

function schedulePreview(): void {
  if (previewTimer) {
    clearTimeout(previewTimer)
  }

  previewTimer = setTimeout(() => {
    void runValidatePreview()
  }, props.debounceMs)
}

async function generateDocument(): Promise<void> {
  if (!validateLocal(true)) {
    return
  }

  const valid = backendValidationOk.value ? true : await runValidatePreview()

  if (!valid) {
    return
  }

  generating.value = true
  errorMessage.value = ''

  try {
    const document = await props.adapter.generateDocument(normalizeValuesForGenerate(), props.generateFormat)
    emit('generated', document)
  } catch (error) {
    errorMessage.value = 'Nu am putut genera documentul.'
    emit('error', error)
  } finally {
    generating.value = false
  }
}

function paneClasses(pane: 'form' | 'preview'): Record<string, boolean> {
  return {
    'contractera-pane-hidden-mobile': props.mobileMode === 'tab' && activePane.value !== pane,
    'contractera-pane-collapsed-mobile': props.mobileMode === 'collapsed' && pane === 'preview',
    'contractera-pane-disabled-mobile': props.mobileMode === 'hidden' && pane === 'preview'
  }
}

async function loadPlaceholders(): Promise<void> {
  loading.value = true
  errorMessage.value = ''

  try {
    placeholders.value = await props.adapter.listPlaceholders()
    values.value = Object.fromEntries(placeholders.value.map((placeholder) => [
      placeholder.key,
      initialValueFor(placeholder)
    ]))
  } catch (error) {
    errorMessage.value = 'Nu am putut incarca formularul contractului.'
    emit('error', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadPlaceholders)

onBeforeUnmount(() => {
  if (previewTimer) {
    clearTimeout(previewTimer)
  }
})
</script>

<template>
  <section class="contractera-shell contractera-composer">
    <header class="contractera-header">
      <div>
        <h2 class="contractera-title">{{ title }}</h2>
        <p class="contractera-subtitle">Completeaza datele si verifica preview-ul generat de backend.</p>
      </div>

      <button
        class="contractera-button contractera-button-primary"
        type="button"
        :disabled="loading || generating"
        data-contractera-generate
        @click="generateDocument"
      >
        {{ generating ? 'Se genereaza...' : 'Genereaza' }}
      </button>
    </header>

    <div v-if="mobileMode === 'tab'" class="contractera-tabs">
      <button
        class="contractera-tab"
        :class="{ 'contractera-tab-active': activePane === 'form' }"
        type="button"
        data-contractera-tab-form
        @click="activePane = 'form'"
      >
        Formular
      </button>
      <button
        class="contractera-tab"
        :class="{ 'contractera-tab-active': activePane === 'preview' }"
        type="button"
        data-contractera-tab-preview
        @click="activePane = 'preview'"
      >
        Preview
      </button>
    </div>

    <p v-if="errorMessage" class="contractera-alert" role="alert">{{ errorMessage }}</p>
    <p v-if="loading" class="contractera-muted">Se incarca...</p>

    <div v-else class="contractera-layout">
      <form
        class="contractera-pane contractera-form"
        :class="paneClasses('form')"
        data-contractera-form-pane
        @submit.prevent="generateDocument"
      >
        <label
          v-for="placeholder in sortedPlaceholders"
          :key="placeholder.key"
          class="contractera-field"
        >
          <span>{{ placeholder.label }}</span>

          <textarea
            v-if="placeholder.input_type === 'textarea' || placeholder.input_type === 'rich_text'"
            class="contractera-input"
            :rows="placeholder.input_config?.rows ?? 4"
            :data-contractera-field="placeholder.key"
            :value="String(values[placeholder.key] ?? '')"
            @input="updateValue(placeholder, ($event.target as HTMLTextAreaElement).value)"
          />

          <select
            v-else-if="placeholder.input_type === 'select'"
            class="contractera-input"
            :data-contractera-field="placeholder.key"
            :value="String(values[placeholder.key] ?? '')"
            @change="updateValue(placeholder, ($event.target as HTMLSelectElement).value)"
          >
            <option value="">Alege</option>
            <option
              v-for="option in placeholder.input_config?.options ?? []"
              :key="String(option.value)"
              :value="String(option.value)"
            >
              {{ option.label }}
            </option>
          </select>

          <input
            v-else-if="placeholder.input_type === 'checkbox'"
            class="contractera-checkbox"
            type="checkbox"
            :data-contractera-field="placeholder.key"
            :checked="Boolean(values[placeholder.key])"
            @change="updateValue(placeholder, ($event.target as HTMLInputElement).checked)"
          >

          <input
            v-else
            class="contractera-input"
            :type="placeholder.input_type === 'number' ? 'number' : placeholder.input_type"
            :min="placeholder.input_config?.min"
            :max="placeholder.input_config?.max"
            :step="placeholder.input_config?.step"
            :placeholder="placeholder.input_config?.placeholder"
            :data-contractera-field="placeholder.key"
            :value="String(values[placeholder.key] ?? '')"
            @input="updateValue(placeholder, ($event.target as HTMLInputElement).value)"
          >

          <small v-if="placeholder.help_text" class="contractera-help">{{ placeholder.help_text }}</small>
          <small v-if="errorFor(placeholder.key)" class="contractera-error">{{ errorFor(placeholder.key) }}</small>
        </label>
      </form>

      <aside
        class="contractera-pane contractera-preview-pane"
        :class="paneClasses('preview')"
        data-contractera-preview-pane
      >
        <div class="contractera-preview-toolbar">
          <span>{{ previewLoading ? 'Se actualizeaza...' : 'Preview' }}</span>
        </div>

        <div
          class="contractera-preview"
          data-contractera-preview
          v-html="previewHtml || '<p class=&quot;contractera-preview-empty&quot;>Completeaza formularul pentru preview.</p>'"
        />

        <ul v-if="warnings.length" class="contractera-warnings">
          <li v-for="warning in warnings" :key="warning">{{ warning }}</li>
        </ul>
      </aside>
    </div>
  </section>
</template>
