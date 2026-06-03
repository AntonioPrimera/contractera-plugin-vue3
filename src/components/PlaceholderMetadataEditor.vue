<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { ContracteraPlaceholderDefinition, ContracteraSdkAdapter } from '../types'

const props = withDefaults(defineProps<{
  adapter: ContracteraSdkAdapter
  title?: string
}>(), {
  title: 'Campuri template'
})

const emit = defineEmits<{
  saved: [placeholders: ContracteraPlaceholderDefinition[]]
  error: [error: unknown]
}>()

const placeholders = ref<ContracteraPlaceholderDefinition[]>([])
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')

const canSave = computed(() => Boolean(props.adapter.updatePlaceholders) && !loading.value && !saving.value)

async function loadPlaceholders(): Promise<void> {
  loading.value = true
  errorMessage.value = ''

  try {
    placeholders.value = await props.adapter.listPlaceholders()
  } catch (error) {
    errorMessage.value = 'Nu am putut incarca metadata placeholderelor.'
    emit('error', error)
  } finally {
    loading.value = false
  }
}

async function saveMetadata(): Promise<void> {
  if (!props.adapter.updatePlaceholders) {
    return
  }

  saving.value = true
  errorMessage.value = ''

  try {
    placeholders.value = await props.adapter.updatePlaceholders(placeholders.value)
    emit('saved', placeholders.value)
  } catch (error) {
    errorMessage.value = 'Nu am putut salva metadata placeholderelor.'
    emit('error', error)
  } finally {
    saving.value = false
  }
}

onMounted(loadPlaceholders)
</script>

<template>
  <section class="contractera-shell contractera-metadata-editor">
    <header class="contractera-header">
      <div>
        <h2 class="contractera-title">{{ title }}</h2>
        <p class="contractera-subtitle">Configureaza etichetele si tipurile de input randate de aplicatia gazda.</p>
      </div>

      <button
        class="contractera-button contractera-button-primary"
        type="button"
        :disabled="!canSave"
        data-contractera-save-metadata
        @click="saveMetadata"
      >
        {{ saving ? 'Se salveaza...' : 'Salveaza' }}
      </button>
    </header>

    <p v-if="errorMessage" class="contractera-alert" role="alert">{{ errorMessage }}</p>
    <p v-if="loading" class="contractera-muted">Se incarca...</p>

    <div v-else class="contractera-metadata-list">
      <article
        v-for="placeholder in placeholders"
        :key="placeholder.key"
        class="contractera-metadata-row"
      >
        <div class="contractera-placeholder-key">{{ placeholder.key }}</div>
        <div class="contractera-placeholder-label-preview">{{ placeholder.label }}</div>

        <label class="contractera-field">
          <span>Eticheta</span>
          <input
            v-model="placeholder.label"
            class="contractera-input"
            :data-contractera-field-label="placeholder.key"
            type="text"
          >
        </label>

        <label class="contractera-field">
          <span>Tip input</span>
          <select v-model="placeholder.input_type" class="contractera-input">
            <option value="text">Text</option>
            <option value="textarea">Textarea</option>
            <option value="date">Data</option>
            <option value="number">Numar</option>
            <option value="email">Email</option>
            <option value="select">Select</option>
            <option value="checkbox">Checkbox</option>
            <option value="rich_text">Rich text</option>
          </select>
        </label>

        <label class="contractera-check">
          <input v-model="placeholder.required" type="checkbox">
          <span>Obligatoriu</span>
        </label>

        <label class="contractera-field contractera-field-wide">
          <span>Text ajutator</span>
          <input v-model="placeholder.help_text" class="contractera-input" type="text">
        </label>
      </article>
    </div>
  </section>
</template>
