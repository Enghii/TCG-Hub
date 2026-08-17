# TCG Hub

Aplicativo mobile para centralizar coleção, descoberta de cartas, decks, mercado e comunidade de múltiplos TCGs.

## Stack

- React Native + Expo 57
- Expo Router
- TypeScript
- Estado local persistente com AsyncStorage

## Recursos atuais

- Seleção entre Magic, Pokémon, Yu-Gi-Oh!, One Piece e Riftbound
- Interface em português ou inglês
- Região BR/US independente do idioma
- Área interna de cada TCG
- Explorar cartas com busca e filtros
- Detalhes de carta e ações de coleção/wishlist
- Estrutura preparada para Mercado, Coleção, Deck Builder, Comunidade e Competitivo

## Executar

```bash
pnpm install
pnpm start
```

Use `pnpm android`, `pnpm ios` ou `pnpm web` para abrir uma plataforma específica.

## Estrutura

- `app/`: rotas e telas
- `src/components/`: componentes reutilizáveis
- `src/data/`: catálogo local inicial
- `src/store/`: preferências e dados do usuário
- `src/theme/`: tokens visuais
- `src/types/`: modelos TypeScript

O catálogo local é demonstrativo. A camada de dados foi isolada para facilitar a integração futura com APIs, autenticação e sincronização em nuvem.
