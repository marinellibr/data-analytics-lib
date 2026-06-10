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

### Setup no Vercel

1. Acesse seu projeto no Vercel
2. Vá para **Settings** → **Environment Variables**
3. Adicione:
   ```
   API_URL_PROD=https://seu-backend.vercel.app
   ```

## 🚀 Uso Básico

### React - Rastreando Cliques

```typescript
import { trackClick, trackPageLoad } from 'data-analytics-lib';

function ProductPage() {
  const handleAddToCart = async () => {
    const response = await trackClick({
      appID: 'ecommerce-pro',
      sessionID: 'sess-abc123',
      location: '/products/shoes',
      element: 'button.add-to-cart'
    });

    if (response.success) {
      console.log('✓ Clique rastreado');
      // Continuar com adição ao carrinho
    } else {
      console.error('✗ Erro:', response.error);
    }
  };

  return <button onClick={handleAddToCart}>Adicionar ao Carrinho</button>;
}
```

### Angular - Rastreando Carregamento de Página

```typescript
import { Component, OnInit } from '@angular/core';
import { trackPageLoad, trackSession } from 'data-analytics-lib';

@Component({
  selector: 'app-dashboard',
  template: '<div>Dashboard</div>'
})
export class DashboardComponent implements OnInit {
  sessionID = 'sess-' + Math.random().toString(36).substr(2, 9);

  async ngOnInit() {
    // Inicializar sessão
    await trackSession({
      sessionID: this.sessionID,
      appID: 'saas-dashboard',
      context: {
        device: 'desktop',
        browser: 'Chrome 126.0',
        referrer: 'google.com'
      }
    });

    // Rastrear carregamento de página
    const startTime = Date.now();
    // ... carregar dados ...
    const timeOnPage = Date.now() - startTime;

    await trackPageLoad({
      sessionID: this.sessionID,
      appID: 'saas-dashboard',
      location: '/dashboard',
      timeOnPage
    });
  }
}
```

## 📋 API

Cada função envia um POST para o endpoint correspondente do backend e adiciona automaticamente o timestamp em formato ISO 8601:

| Função | Endpoint | Timestamp adicionado |
|--------|----------|----------------------|
| `trackClick(event)` | `/events` | `timestamp` |
| `trackPageLoad(event)` | `/events` | `timestamp` |
| `trackHttpCall(event)` | `/http-calls` | `timestamp` |
| `trackSession(session)` | `/sessions` | `startTime` |

### Tipos de Entrada

```typescript
// trackClick
interface ClickEventInput {
  appID: string;      // ID único da aplicação (ex: 'ecommerce-pro')
  sessionID: string;  // ID da sessão do usuário (ex: 'sess-abc123')
  location: string;   // Caminho da página (ex: '/products/shoes')
  element?: string;   // Seletor CSS ou label do elemento (ex: 'button.add-to-cart')
}

// trackPageLoad
interface PageLoadEventInput {
  appID: string;
  sessionID: string;
  location: string;
  timeOnPage: number; // tempo na página em ms (ex: 5000)
}

// trackHttpCall
interface HttpCallEventInput {
  appID: string;
  sessionID: string;
  endpoint: string;    // ex: '/api/products'
  method: HttpMethod;  // 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  status: number;      // HTTP status (ex: 200, 404, 500)
  duration: number;    // tempo de resposta em ms (ex: 145)
}

// trackSession
interface SessionInput {
  sessionID: string;
  appID: string;
  userID?: string;     // ID do usuário (opcional)
  context: {
    device: 'desktop' | 'mobile' | 'tablet';
    browser: string;  // ex: 'Chrome 126.0'
    referrer: string; // ex: 'google.com' ou 'direct'
  };
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

- ✅ **Timestamp Automático**: A data/hora atual é adicionada automaticamente em formato ISO 8601 (campo `timestamp` ou `startTime`)
- ✅ **Endpoints Unificados**: Cliques e page views são enviados para `/events` com discriminador `type` ('click' | 'pageview')
- ✅ **Segurança**: Query strings e fragments são removidos automaticamente (evita vazar tokens, senhas, termos de busca)
- ✅ **Validação**: Todos os campos de texto são truncados em 500 caracteres
- ✅ **Tratamento de Erros**: Erros de rede e HTTP são capturados e retornados em formato estruturado
- ✅ **TypeScript**: Type safety completo com tipagem forte

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

## 📝 Exemplo Completo: E-commerce

```typescript
import { trackClick, trackPageLoad, trackHttpCall, trackSession } from 'data-analytics-lib';

// Gerar session ID único
const sessionID = 'sess-' + Math.random().toString(36).substr(2, 9);
const appID = 'ecommerce-pro';

// 1. Inicializar sessão quando usuário entra
await trackSession({
  sessionID,
  appID,
  context: {
    device: 'desktop',
    browser: 'Chrome 126.0',
    referrer: 'google.com'
  }
});

// 2. Rastrear carregamento de página
const pageLoadStart = Date.now();
// ... carregar produtos ...
await trackPageLoad({
  sessionID,
  appID,
  location: '/products',
  timeOnPage: Date.now() - pageLoadStart
});

// 3. Rastrear clique em produto
const handleViewProduct = async () => {
  await trackClick({
    sessionID,
    appID,
    location: '/products',
    element: 'product-card'
  });
};

// 4. Rastrear chamada HTTP de adicionar ao carrinho
const handleAddToCart = async (productId: string) => {
  const startTime = Date.now();
  
  try {
    const response = await fetch('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity: 1 })
    });
    
    const duration = Date.now() - startTime;
    
    // Rastrear a chamada HTTP
    await trackHttpCall({
      sessionID,
      appID,
      endpoint: '/api/cart/items',
      method: 'POST',
      status: response.status,
      duration
    });
    
    if (response.ok) {
      console.log('Produto adicionado ao carrinho');
    }
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
  }
};

// 5. Rastrear clique no checkout
const handleCheckout = async () => {
  await trackClick({
    sessionID,
    appID,
    location: '/cart',
    element: 'button.checkout'
  });
  
  // Navegar para página de checkout
  window.location.href = '/checkout';
};
```

## 🎯 Roadmap

- [ ] Publicar no npm
- [ ] Implementar retry com backoff exponencial
- [ ] Suporte a batch de eventos
- [ ] Middleware para logging automático

## 📄 Licença

ISC
