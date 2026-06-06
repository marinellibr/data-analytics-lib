# Data Analytics Lib

Biblioteca agnóstica a framework para rastrear eventos analíticos em projetos React e Angular (MFE). Escrita em TypeScript com suporte a ambos os frameworks.

## 📦 Instalação

### Via npm

```bash
npm install data-analytics-lib
```

### Via yarn

```bash
yarn add data-analytics-lib
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
import { trackEvent } from 'data-analytics-lib';

function MyComponent() {
  const handleClick = async () => {
    const response = await trackEvent({
      appID: 'mfe-dashboard',
      action: 'button_click',
      where: '/analytics'
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
import { trackEvent } from 'data-analytics-lib';

@Component({
  selector: 'app-analytics',
  template: '<button (click)="onTrack()">Rastrear</button>'
})
export class AnalyticsComponent {
  async onTrack() {
    const response = await trackEvent({
      appID: 'mfe-reports',
      action: 'generate_report',
      where: '/reports'
    });

    if (!response.success) {
      console.error('Erro de rastreamento:', response.error);
    }
  }
}
```

## 📋 API

### `trackEvent(entry: AnalyticsEntry): Promise<AnalyticsResponse>`

Rastreia um evento enviando os dados ao backend.

**Parâmetros:**
```typescript
interface AnalyticsEntry {
  appID: string;    // ID único da aplicação (ex: 'mfe-dashboard')
  action: string;   // Ação realizada (ex: 'button_click', 'page_view')
  where: string;    // Localização/página (ex: '/dashboard', '/settings')
}
```

**Retorno:**
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

- ✅ **DateTime**: A data/hora atual é adicionada automaticamente ao objeto enviado
- ✅ **POST**: Requisição HTTP POST é feita para `/new-entry` do backend
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
import { trackEvent } from 'data-analytics-lib';

const handleUserAction = async (action: string) => {
  const response = await trackEvent({
    appID: 'mfe-shop',
    action,
    where: window.location.pathname
  });

  if (response.success) {
    console.log('Evento registrado com sucesso');
  } else {
    console.error(`Erro [${response.error?.code}]: ${response.error?.message}`);
  }
};

// Uso
await handleUserAction('add_to_cart');
```

## 🎯 Roadmap

- [ ] Implementar retry com backoff exponencial
- [ ] Suporte a batch de eventos
- [ ] Middleware para logging automático

## 📄 Licença

ISC
