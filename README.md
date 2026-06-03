# Contractera Plugin Vue 3

Vue 3 SDK pentru integrarea fluxurilor Contractera in aplicatii externe.

Pachetul este gandit pentru integrare backend-to-backend: frontend-ul aplicatiei gazda foloseste componentele Vue, iar componentele primesc un `adapter` implementat de aplicatia gazda. Adapterul apeleaza backend-ul propriu al aplicatiei gazda, iar backend-ul respectiv comunica server-to-server cu Contractera.

## Instalare

```bash
npm install @antonioprimera/contractera-plugin-vue3
```

Import CSS global:

```ts
import '@antonioprimera/contractera-plugin-vue3/styles'
```

## Cerinte backend

Aplicatia gazda trebuie sa aiba un backend proxy care:

1. pastreaza `Application token` si `account token` exclusiv server-side;
2. autentifica si autorizeaza userul local;
3. cheama API-ul Contractera server-to-server;
4. returneaza catre browser doar payload-uri fara tokenuri;
5. proxy-uieste download-urile de documente printr-un endpoint local.

Rute locale recomandate in aplicatia gazda:

```http
GET /contractera/templates
POST /contractera/templates
GET /contractera/templates/{templateId}/placeholders
PATCH /contractera/templates/{templateId}/placeholders
POST /contractera/templates/{templateId}/validate-preview
POST /contractera/templates/{templateId}/generate
GET /contractera/generated-documents/{documentId}
GET /contractera/generated-documents/{documentId}/download?format=docx|pdf|html
```

## Securitate

Nu trimite tokenuri Contractera in browser. Componentele nu au props pentru token, base URL Contractera sau Sanctum token.

Fluxul corect:

1. Frontend-ul aplicatiei gazda randeaza componentele SDK.
2. SDK-ul cheama metodele din `adapter`.
3. Adapterul cheama backend-ul aplicatiei gazda.
4. Backend-ul aplicatiei gazda cheama Contractera cu account tokenul stocat server-side.

## Adapter

```ts
import type { ContracteraSdkAdapter } from '@antonioprimera/contractera-plugin-vue3'

async function requestJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {})
    },
    ...init
  })

  if (!response.ok) {
    throw new Error(`Contractera proxy request failed: ${response.status}`)
  }

  return await response.json()
}

export function createContracteraAdapter(templateId: string): ContracteraSdkAdapter {
  return {
    listPlaceholders() {
      return requestJson(`/contractera/templates/${templateId}/placeholders`)
    },

    updatePlaceholders(placeholders) {
      return requestJson(`/contractera/templates/${templateId}/placeholders`, {
        method: 'PATCH',
        body: JSON.stringify({ placeholders })
      })
    },

    validatePreview(values) {
      return requestJson(`/contractera/templates/${templateId}/validate-preview`, {
        method: 'POST',
        body: JSON.stringify({ values })
      })
    },

    generateDocument(values, format = 'docx') {
      return requestJson(`/contractera/templates/${templateId}/generate`, {
        method: 'POST',
        body: JSON.stringify({ values, format })
      })
    }
  }
}
```

Daca backend-ul aplicatiei gazda foloseste CSRF pentru requesturile same-origin, adauga headerul CSRF in helperul `requestJson`.

## PlaceholderMetadataEditor

```vue
<script setup lang="ts">
import { PlaceholderMetadataEditor } from '@antonioprimera/contractera-plugin-vue3'
import { createContracteraAdapter } from './contractera-adapter'

const adapter = createContracteraAdapter('template-id')
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
import { createContracteraAdapter } from './contractera-adapter'

const adapter = createContracteraAdapter('template-id')
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
.host-contractera {
  --contractera-primary: #26705f;
  --contractera-primary-contrast: #ffffff;
  --contractera-bg: #f4f8f4;
  --contractera-surface: #ffffff;
  --contractera-border: #d6e1d8;
  --contractera-text: #18211d;
  --contractera-muted: #65706a;
  --contractera-danger: #b42318;
  --contractera-radius: 8px;
}
```

```vue
<template>
  <div class="host-contractera">
    <DocumentComposer :adapter="adapter" />
  </div>
</template>
```

## Testare manuala in aplicatia gazda

Checklist minim:

1. Creeaza sau conecteaza tenantul local la un account Contractera prin backend.
2. Incarca un template `.docx` si seteaza `placeholder_pattern`.
3. Listeaza template-urile prin backend-ul gazda.
4. Deschide `PlaceholderMetadataEditor` si salveaza metadata.
5. Deschide `DocumentComposer`, completeaza campuri si verifica live preview.
6. Verifica blocarea generarii cand backend-ul Contractera returneaza `valid = false`.
7. Genereaza document si descarca `docx`, `pdf` si `html` prin proxy-ul local.
8. Verifica layout-ul pe desktop si mobil; pentru mobil se recomanda `mobile-mode="tab"`.

## Publicare npm

Inainte de publish:

```bash
npm run test
npm run build
npm audit --audit-level=moderate
```

Publish:

```bash
npm publish --access public
```

Aplicatiile gazda pot apoi instala versiunea publicata:

```bash
npm install @antonioprimera/contractera-plugin-vue3
```

## Dezvoltare

```bash
npm install
npm run test
npm run build
```
