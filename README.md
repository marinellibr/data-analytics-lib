# Data Analytics Lib

Biblioteca agnóstica a framework para rastrear eventos analíticos em projetos React e Angular (MFE).

## Instalação

```bash
npm install data-analytics-lib
```

## Configuração

A biblioteca usa `NODE_ENV` para determinar o ambiente:

- **Desenvolvimento**: `http://localhost:3000`
- **Produção**: variável de ambiente `API_URL_PROD`

No Render, defina em Environment Variables:
```
API_URL_PROD=https://seu-backend.onrender.com
```

## Uso

```typescript
import { trackEvent } from 'data-analytics-lib';

const response = await trackEvent({
  appID: 'mfe-dashboard',
  action: 'button_click',
  where: '/analytics'
});

if (response.success) {
  console.log('Evento rastreado:', response.data);
} else {
  console.error('Erro:', response.error);
}
```

## Tipos

```typescript
interface AnalyticsEntry {
  appID: string;      // ID da aplicação
  action: string;     // Ação realizada
  where: string;      // Localização/página
}

interface AnalyticsResponse {
  success: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

## O que acontece automaticamente

- `dateTime`: Data/hora atual é adicionada ao objeto
- POST é feito para `/new-entry` do backend
- Erros são capturados e retornados estruturados

## Notas

- TODO: Implementar retry com backoff exponencial
