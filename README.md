# Contractera Plugin Vue 3

Vue 3 SDK pentru integrarea fluxurilor Contractera in aplicatii externe precum AgroCity sau ProjectCity.

Pachetul este gandit pentru integrare backend-to-backend: frontend-ul aplicatiei gazda foloseste componentele Vue, iar componentele primesc un `adapter` implementat de aplicatia gazda. Adapterul apeleaza backend-ul propriu al aplicatiei gazda, iar backend-ul respectiv comunica server-to-server cu Contractera.

## Instalare

```bash
npm install @antonioprimera/contractera-plugin-vue3
```

Import CSS global:

```ts
import '@antonioprimera/contractera-plugin-vue3/styles'
```

## Securitate

Nu trimite tokenuri Contractera in browser. Componentele nu au props pentru token, base URL Contractera sau Sanctum token.

Fluxul corect:

1. Frontend-ul AgroCity/ProjectCity randeaza componentele SDK.
2. SDK-ul cheama metodele din `adapter`.
3. Adapterul cheama backend-ul aplicatiei gazda.
4. Backend-ul aplicatiei gazda cheama Contractera cu account tokenul stocat server-side.

## Adapter

```ts
import type { ContracteraSdkAdapter } from '@antonioprimera/contractera-plugin-vue3'

export const adapter: ContracteraSdkAdapter = {
  async listPlaceholders() {
    return await fetch('/contractera/templates/current/placeholders').then((response) => response.json())
  },

  async updatePlaceholders(placeholders) {
    return await fetch('/contractera/templates/current/placeholders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeholders })
    }).then((response) => response.json())
  },

  async validatePreview(values) {
    return await fetch('/contractera/templates/current/validate-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values })
    }).then((response) => response.json())
  },

  async generateDocument(values, format = 'docx') {
    return await fetch('/contractera/templates/current/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values, format })
    }).then((response) => response.json())
  }
}
```

## PlaceholderMetadataEditor

```vue
<script setup lang="ts">
import { PlaceholderMetadataEditor } from '@antonioprimera/contractera-plugin-vue3'
import { adapter } from './contractera-adapter'
</script>

<template>
  <PlaceholderMetadataEditor :adapter="adapter" />
</template>
```

Componenta incarca placeholder-ele prin `adapter.listPlaceholders()` si salveaza metadata prin `adapter.updatePlaceholders()`, daca metoda exista.

## DocumentComposer

```vue
<script setup lang="ts">
import { DocumentComposer } from '@antonioprimera/contractera-plugin-vue3'
import { adapter } from './contractera-adapter'
</script>

<template>
  <DocumentComposer
    :adapter="adapter"
    mobile-mode="tab"
    :debounce-ms="350"
    @generated="document => console.log(document.download_urls)"
  />
</template>
```

Comportament:

- incarca metadata placeholderelor prin `adapter.listPlaceholders()`;
- valideaza local campuri simple, precum `required`, `number` si `select`;
- trimite live preview debounced catre `adapter.validatePreview(values)` doar cand userul modifica formularul;
- la generare, cere intai validare backend OK, apoi cheama `adapter.generateDocument(values, format)`.

## Mobile modes

`DocumentComposer` accepta `mobileMode`:

- `tab`: pe mobil userul comuta manual intre formular si preview;
- `collapsed`: preview-ul ramane vizibil, dar compact;
- `hidden`: preview-ul este ascuns pe mobil.

## Styling

Pachetul foloseste CSS variables. Aplicatia gazda poate suprascrie variabilele:

```css
.agrocity-contractera {
  --contractera-primary: #26705f;
  --contractera-bg: #f4f8f4;
  --contractera-surface: #ffffff;
  --contractera-border: #d6e1d8;
  --contractera-text: #18211d;
}
```

```vue
<template>
  <div class="agrocity-contractera">
    <DocumentComposer :adapter="adapter" />
  </div>
</template>
```

## Dezvoltare

```bash
npm install
npm run test
npm run build
```
