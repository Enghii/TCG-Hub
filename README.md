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
- Coleção com exemplares, quantidade, condição, idioma, foil, preço de aquisição, edição e remoção
- Resumo de valor estimado e investido, busca, filtros, wishlist e migração dos dados anteriores
- Catálogo online de Magic via Scryfall e Pokémon via Pokémon TCG API
- Adaptador seguro preparado para o catálogo oficial de Riftbound via servidor do TCG Hub
- Conta por e-mail, modo visitante, backup/restauração e sincronização automática via Supabase
- Deck Builder com múltiplos decks, busca no catálogo, quantidades e sincronização no backup
- Captura ou seleção de foto com revisão de até 10 cartas identificadas automaticamente
- Estrutura preparada para Mercado, Deck Builder, Comunidade e Competitivo

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

## Catálogos externos

O aplicativo consulta Scryfall e Pokémon TCG API em tempo real e mantém os dados locais como contingência. Cartas externas salvas na coleção ou wishlist preservam um snapshot para continuarem disponíveis offline.

Para Riftbound, copie `.env.example` para `.env` e preencha `EXPO_PUBLIC_RIFTBOUND_CATALOG_URL` somente depois que o proxy seguro do TCG Hub estiver implantado. A chave aprovada pela Riot deve permanecer exclusivamente no servidor; nunca use uma chave secreta em uma variável `EXPO_PUBLIC_*`.

Preços em BRL provenientes dos catálogos internacionais são estimativas convertidas de USD e não representam ainda o mercado brasileiro.

## Conta e sincronização

1. Crie um projeto no Supabase.
2. Abra o SQL Editor e execute `supabase/schema.sql` para criar a tabela e as políticas de segurança por usuário.
3. Copie `.env.example` para `.env`.
4. Preencha `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` com os valores públicos do projeto.
5. Reinicie o Expo após alterar o `.env`.

O aplicativo nunca deve receber a chave `service_role`. A tabela usa Row Level Security para que cada usuário leia e altere somente o próprio backup.

A sessão é restaurada e renovada automaticamente no dispositivo até o usuário escolher sair. Em uma versão de produção nativa, o token de renovação deverá ser migrado do AsyncStorage para armazenamento criptografado (por exemplo, `expo-secure-store`).

## Scanner de cartas

O aplicativo inclui a Edge Function `supabase/functions/scan-cards`. Ela recebe a foto, limita o resultado a 10 cartas e usa visão computacional para sugerir nome, coleção e número. O usuário revisa as sugestões antes de adicioná-las ao deck.

Para ativá-la, configure `OPENAI_API_KEY` como secret do Supabase, publique a função `scan-cards` com verificação JWT e reinicie o Expo. Por padrão, o aplicativo monta a URL da função a partir de `EXPO_PUBLIC_SUPABASE_URL`; `EXPO_PUBLIC_CARD_SCANNER_URL` permite usar outro servidor. A chave de IA nunca deve ser colocada em uma variável `EXPO_PUBLIC_*`.
