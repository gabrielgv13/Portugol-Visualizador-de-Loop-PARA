# Simulador de Laço PARA (Portugol Studio)

Aplicação web interativa para demonstrar visualmente o funcionamento do laço de repetição **PARA** na programação, incluindo:

- execução passo a passo do laço básico;
- execução passo a passo do laço percorrendo vetores;
- destaque visual do trecho de código ativo;
- inspeção da variável de controle `i` e da saída de console.

## Tecnologias

- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4

## Executar localmente

### Pré-requisitos

- Node.js 20+ (recomendado Node.js 22)
- npm

### Passos

```bash
npm install
npm run dev
```

Abra em `http://localhost:3000`.

## Build de produção

```bash
npm run build
npm run preview
```

## Publicação no GitHub Pages

Este repositório já inclui o workflow `.github/workflows/deploy-pages.yml`.

### 1) Enviar para o GitHub

Crie o repositório no GitHub e faça push da branch `main`.

### 2) Ativar GitHub Pages

No GitHub, acesse:

`Settings` → `Pages` → `Build and deployment` → `Source: GitHub Actions`

### 3) Deploy automático

Cada push na `main` dispara o workflow e publica a versão atualizada.

## Estrutura do projeto

```text
.
├─ src/
│  ├─ App.tsx
│  ├─ index.css
│  └─ main.tsx
├─ .github/workflows/deploy-pages.yml
├─ index.html
├─ package.json
└─ vite.config.ts
```

## Observações sobre o caminho base (base path)

O `vite.config.ts` já está preparado para GitHub Pages:

- em desenvolvimento: usa `/`;
- em produção: usa automaticamente `/<nome-do-repositorio>/`;
- para repositórios do tipo `<usuario>.github.io`: usa `/`.

Isso evita erros de carregamento de assets após o deploy.
