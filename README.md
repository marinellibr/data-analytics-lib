# Data Analytics Lib

Biblioteca agnóstica a framework para rastrear eventos analíticos em projetos React e Angular (MFE). Escrita em TypeScript com suporte a ambos os frameworks.

## 📦 Instalação

### Instalação Local (Git)

Como a biblioteca ainda não está publicada no npm, instale diretamente do repositório GitHub:

```bash
npm install github:marinellibr/data-analytics-lib
```

Ou especifique a branch/tag:

```bash
npm install github:marinellibr/data-analytics-lib#main
```

### Instalação com arquivo local

Se preferir instalar localmente (em desenvolvimento):

```bash
npm install /caminho/para/data-analytics-lib
```

Ou via referência relativa (se em monorepo):

```bash
npm install ../data-analytics-lib
```

**Após instalar**, compile a biblioteca:

```bash
cd node_modules/data-analytics-lib
npm run build
```

## ⚙️ Configuração

A biblioteca utiliza `NODE_ENV` para determinar o ambiente automaticamente:

- **Desenvolvimento** (`development`): `http://localhost:3000`
- **Produção** (`production`): Variável de ambiente `API_URL_PROD`

### Setup no Render

1. Acesse o dashboard do seu serviço no Render
2. Vá para **Environment** → **Environment Variables**
3. Adicione:
   ```
   API_URL_PROD=https://seu-backend.onrender.com
   ```

## 🚀 Uso Básico

### React

```typescript
import { trackClick, trackPageLoad } from 'data-analytics-lib';

function MyComponent() {
  const handleClick = async () => {
    const response = await trackClick({
      appID: 'mfe-dashboard',
      sessionID: 's001',
      where: '/analytics',
      target: '#btn-export'
    });

    if (response.success) {
      console.log('✓ Evento rastreado');
    } else {
      console.error('✗ Erro:', response.error);
    }
  };

  return <button onClick={handleClick}>Clique aqui</button>;
}
```

### Angular

```typescript
import { Component } from '@angular/core';
import { trackSession } from 'data-analytics-lib';

@Component({
  selector: 'app-analytics',
  template: '<button (click)="onTrack()">Rastrear</button>'
})
export class AnalyticsComponent {
  async onTrack() {
    const response = await trackSession({
      sessionID: 's001',
      appID: 'mfe-reports',
      device: 'desktop',
      browser: 'Chrome 124',
      referrer: 'google.com'
    });

    if (!response.success) {
      console.error('Erro de rastreamento:', response.error);
    }
  }
}
```

## 📋 API

Cada função envia um POST para o endpoint correspondente do backend e adiciona automaticamente o timestamp no formato `dd/MM/yyyy hh:mm AM/PM`:

| Função | Endpoint | Timestamp adicionado |
|--------|----------|----------------------|
| `trackClick(event)` | `/click-events` | `dateTime` |
| `trackPageLoad(event)` | `/page-load-events` | `dateTime` |
| `trackHttpCall(event)` | `/http-calls` | `dateTime` |
| `trackSession(session)` | `/sessions` | `startedAt` |

**Parâmetros:**
```typescript
// trackClick
interface ClickEventInput {
  appID: string;     // ID único da aplicação (ex: 'crm')
  sessionID: string; // ID da sessão do usuário (ex: 's001')
  where: string;     // Página onde ocorreu (ex: '/crm/contacts')
  target: string;    // Seletor CSS ou label do elemento (ex: '#btn-save')
}

// trackPageLoad
interface PageLoadEventInput {
  appID: string;
  sessionID: string;
  where: string;
  timeOnPage: number; // tempo na página em ms
}

// trackHttpCall
interface HttpCallEventInput {
  appID: string;
  sessionID: string;
  endpoint: string;   // ex: '/api/crm/contacts'
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  httpStatus: number; // ex: 200
  duration: number;   // tempo de resposta em ms
}

// trackSession
interface SessionInput {
  sessionID: string;
  appID: string;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;  // ex: 'Chrome 124'
  referrer: string; // ex: 'google.com' ou 'direct'
}
```

**Retorno (todas as funções):**
```typescript
interface AnalyticsResponse {
  success: boolean;
  data?: unknown;     // Dados retornados pelo backend (se sucesso)
  error?: {
    code: string;     // Código do erro (HTTP_400, NETWORK_ERROR, etc)
    message: string;  // Mensagem descritiva
    details?: unknown; // Detalhes adicionais
  };
}
```

## ✨ Funcionalidades Automáticas

- ✅ **DateTime**: A data/hora atual é adicionada automaticamente ao objeto enviado, no formato `dd/MM/yyyy hh:mm AM/PM` (campo `dateTime`, ou `startedAt` para sessões)
- ✅ **POST**: Requisição HTTP POST é feita para o endpoint correspondente do backend (`/click-events`, `/page-load-events`, `/http-calls`, `/sessions`)
- ✅ **Privacidade**: Query strings e fragments são removidos automaticamente de `where`, `endpoint` e `referrer` antes do envio (evita vazar tokens, e-mails e termos de busca), e todos os campos de texto são truncados em 500 caracteres
- ✅ **Erro Estruturado**: Erros de rede e HTTP são capturados e retornados de forma estruturada
- ✅ **TypeScript**: Typings completos em TypeScript

## 📊 Coverage de Testes

```
File          | % Stmts | % Branch | % Funcs | % Lines
--------------|---------|----------|---------|----------
analytics.ts  |     100 |      100 |     100 |     100
config.ts     |     100 |      100 |     100 |     100
```

**Total: 100% de cobertura em todos os parâmetros**

## 🧪 Executar Testes

```bash
# Testes simples
npm test

# Testes com watch (modo desenvolvimento)
npm run test:watch

# Coverage completo
npm run test:coverage
```

## 🔧 Build

Para compilar TypeScript para JavaScript:

```bash
npm run build
```

Saída: pasta `dist/` com arquivos `.js` e `.d.ts`

## 📝 Exemplo Completo

```typescript
import { trackClick, trackHttpCall } from 'data-analytics-lib';

const handleAddToCart = async () => {
  const response = await trackClick({
    appID: 'mfe-shop',
    sessionID: 's042',
    where: window.location.pathname,
    target: '#btn-add-to-cart'
  });

  if (response.success) {
    console.log('Evento registrado com sucesso');
  } else {
    console.error(`Erro [${response.error?.code}]: ${response.error?.message}`);
  }
};

// Rastreando uma chamada HTTP
await trackHttpCall({
  appID: 'mfe-shop',
  sessionID: 's042',
  endpoint: '/api/cart',
  method: 'POST',
  httpStatus: 201,
  duration: 240
});
```

## 🎯 Roadmap

- [ ] Publicar no npm
- [ ] Implementar retry com backoff exponencial
- [ ] Suporte a batch de eventos
- [ ] Middleware para logging automático

## 📄 Licença

ISC
