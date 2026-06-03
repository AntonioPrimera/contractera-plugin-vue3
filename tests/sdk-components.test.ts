import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { DocumentComposer, PlaceholderMetadataEditor } from '../src'
import type { ContracteraPlaceholderDefinition, ContracteraSdkAdapter } from '../src'

const placeholders: ContracteraPlaceholderDefinition[] = [
  {
    key: 'LESSOR_NAME',
    label: 'Nume arendator',
    input_type: 'text',
    required: true,
    help_text: 'Numele complet din contract',
    display_order: 1,
    input_config: null
  },
  {
    key: 'AREA',
    label: 'Suprafata',
    input_type: 'number',
    required: true,
    display_order: 2,
    input_config: {
      min: 0,
      step: 0.01
    }
  }
]

function createAdapter(): ContracteraSdkAdapter {
  const placeholderFixtures = structuredClone(placeholders)

  return {
    listPlaceholders: vi.fn().mockResolvedValue(placeholderFixtures),
    updatePlaceholders: vi.fn(async (nextPlaceholders) => nextPlaceholders),
    validatePreview: vi.fn().mockResolvedValue({
      valid: true,
      errors: [],
      html: '<article><p>Contract pentru Ana Popescu.</p></article>'
    }),
    generateDocument: vi.fn().mockResolvedValue({
      generated_document_id: 'doc-1',
      status: 'completed',
      status_url: '/api/v1/generated-documents/doc-1',
      expires_at: null,
      download_urls: {
        docx: '/download?format=docx',
        pdf: '/download?format=pdf',
        html: '/download?format=html'
      }
    })
  }
}

describe('PlaceholderMetadataEditor', () => {
  it('loads placeholders through the backend adapter and saves metadata edits', async () => {
    const adapter = createAdapter()

    const wrapper = mount(PlaceholderMetadataEditor, {
      props: {
        adapter
      }
    })

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Nume arendator')
    })

    await wrapper.get('[data-contractera-field-label="LESSOR_NAME"]').setValue('Arendator')
    await wrapper.get('[data-contractera-save-metadata]').trigger('click')

    expect(adapter.listPlaceholders).toHaveBeenCalledOnce()
    expect(adapter.updatePlaceholders).toHaveBeenCalledWith([
      expect.objectContaining({
        key: 'LESSOR_NAME',
        label: 'Arendator'
      }),
      expect.objectContaining({
        key: 'AREA'
      })
    ])
  })
})

describe('DocumentComposer', () => {
  it('debounces validate-preview calls when form values change and renders backend HTML', async () => {
    vi.useFakeTimers()
    const adapter = createAdapter()

    const wrapper = mount(DocumentComposer, {
      props: {
        adapter,
        debounceMs: 250
      }
    })

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Nume arendator')
    })

    await wrapper.get('[data-contractera-field="LESSOR_NAME"]').setValue('Ana Popescu')
    await nextTick()

    expect(adapter.validatePreview).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(260)

    expect(adapter.validatePreview).toHaveBeenCalledWith({
      LESSOR_NAME: 'Ana Popescu',
      AREA: ''
    })
    expect(wrapper.get('[data-contractera-preview]').html()).toContain('Contract pentru Ana Popescu')

    vi.useRealTimers()
  })

  it('uses local validation for simple required/select/number fields and blocks generate until backend validates', async () => {
    const adapter = createAdapter()

    const wrapper = mount(DocumentComposer, {
      props: {
        adapter,
        debounceMs: 0
      }
    })

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Nume arendator')
    })

    await wrapper.get('[data-contractera-generate]').trigger('click')

    expect(adapter.generateDocument).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Camp obligatoriu')

    await wrapper.get('[data-contractera-field="LESSOR_NAME"]').setValue('Ana Popescu')
    await wrapper.get('[data-contractera-field="AREA"]').setValue('12.5')
    await wrapper.get('[data-contractera-generate]').trigger('click')

    expect(adapter.generateDocument).toHaveBeenCalledWith({
      LESSOR_NAME: 'Ana Popescu',
      AREA: 12.5
    }, 'docx')
  })

  it('supports mobile tab mode by showing one pane at a time', async () => {
    const adapter = createAdapter()

    const wrapper = mount(DocumentComposer, {
      props: {
        adapter,
        mobileMode: 'tab'
      }
    })

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Nume arendator')
    })

    expect(wrapper.get('[data-contractera-form-pane]').isVisible()).toBe(true)
    expect(wrapper.get('[data-contractera-preview-pane]').classes()).toContain('contractera-pane-hidden-mobile')

    await wrapper.get('[data-contractera-tab-preview]').trigger('click')

    expect(wrapper.get('[data-contractera-preview-pane]').classes()).not.toContain('contractera-pane-hidden-mobile')
    expect(wrapper.get('[data-contractera-form-pane]').classes()).toContain('contractera-pane-hidden-mobile')
  })

  it('does not accept browser-side Contractera tokens as props', () => {
    expect('contracteraToken' in DocumentComposer.props).toBe(false)
    expect('token' in DocumentComposer.props).toBe(false)
    expect('contracteraToken' in PlaceholderMetadataEditor.props).toBe(false)
    expect('token' in PlaceholderMetadataEditor.props).toBe(false)
  })
})
