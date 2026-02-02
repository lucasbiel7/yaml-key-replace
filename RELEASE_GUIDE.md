# Release Guide

Este guia explica como fazer releases da extensão YAML Key Replace.

## 📋 Pré-requisitos

### Secrets do GitHub (necessários para publicação)

Configure os seguintes secrets no repositório GitHub:

1. **`VSCE_TOKEN`** - Token do VS Code Marketplace
   - Acesse: https://dev.azure.com/
   - Crie um Personal Access Token (PAT)
   - Organização: "All accessible organizations"
   - Escopo: "Marketplace > Manage"
   - Adicione em: Settings > Secrets and variables > Actions

2. **`VSX_TOKEN`** - Token do Open VSX Registry
   - Acesse: https://open-vsx.org/
   - Faça login com GitHub
   - Vá em Settings > Access Tokens
   - Crie novo token
   - Adicione em: Settings > Secrets and variables > Actions

3. **`PAT_TOKEN`** (opcional) - Token do GitHub
   - Acesse: Settings > Developer settings > Personal access tokens
   - Crie token com escopo `repo`
   - Permite que workflows acionem outros workflows

## 🚀 Processo de Release

### 1. Preparar a Release

```bash
# Atualizar versão (escolha um)
npm version patch  # 0.0.1 -> 0.0.2 (correções)
npm version minor  # 0.0.1 -> 0.1.0 (novas features)
npm version major  # 0.0.1 -> 1.0.0 (breaking changes)
```

### 2. Atualizar CHANGELOG.md

Adicione uma nova seção com as mudanças:

```markdown
## [0.0.2] - 2026-02-03

### Added
- Nova funcionalidade X
- Suporte para Y

### Fixed
- Correção do bug Z
- Melhoria na performance

---
```

### 3. Commit e Push

```bash
git add package.json CHANGELOG.md
git commit -m "chore: release v0.0.2"
git push origin main
```

### 4. Processo Automático

Os workflows do GitHub Actions irão automaticamente:

1. ✅ **Auto Tag Release** - Cria a tag `v0.0.2`
2. ✅ **Publish Extension** - Publica nos marketplaces
   - Build da extensão
   - Publica no VS Code Marketplace
   - Publica no Open VSX Registry
   - Cria GitHub Release com changelog

## 🔄 Workflows Disponíveis

### CI (`ci.yml`)
- **Trigger:** Push/PR para `main` ou `develop`
- **Função:** Valida código (lint, compile, test, package)
- **Artefato:** `.vsix` (retido por 7 dias)

### Auto Tag Release (`tag-release.yml`)
- **Trigger:** Push para `main`
- **Função:** Cria tag baseada na versão do `package.json`
- **Exemplo:** `v0.0.2`

### Pre-Release (`pre-release.yml`)
- **Trigger:** Push para `develop` ou manual
- **Função:** Cria pre-release para testes
- **Exemplo:** `v0.0.1-beta.42`
- **Nota:** NÃO publica nos marketplaces

### Publish Extension (`publish.yml`)
- **Trigger:** Push de tags `v*`
- **Função:** Publica nos marketplaces e cria release
- **Jobs:**
  1. Build da extensão
  2. Publica no VS Code Marketplace
  3. Publica no Open VSX Registry
  4. Cria GitHub Release

## 🧪 Testar Antes de Publicar

### Opção 1: Pre-Release (Recomendado)

```bash
# Fazer push para develop
git checkout develop
git merge main
git push origin develop

# Ou acionar manualmente no GitHub Actions
```

Isso cria uma pre-release sem publicar nos marketplaces.

### Opção 2: Testar Localmente

```bash
# Compilar e empacotar
npm run compile
npx vsce package

# Instalar localmente
code --install-extension yaml-key-replace-0.0.1.vsix
# ou
cursor --install-extension yaml-key-replace-0.0.1.vsix
```

## 📊 Monitorar Workflows

1. Acesse: https://github.com/lucasbiel7/yaml-key-replace/actions
2. Veja o status de cada workflow
3. Clique em um workflow para ver detalhes
4. Expanda steps para ver logs

## ⚠️ Troubleshooting

### Tag já existe
```bash
# Deletar tag local e remota
git tag -d v0.0.2
git push origin :refs/tags/v0.0.2

# Ou atualizar versão
npm version patch
```

### Versão já publicada
- Workflows automaticamente pulam publicação
- Aumente a versão e tente novamente

### Workflow não executou
- Verifique se secrets estão configurados
- Use `PAT_TOKEN` ao invés de `GITHUB_TOKEN`
- Verifique logs no GitHub Actions

### Erro de publicação
- Verifique permissões dos tokens
- Confirme que o nome da extensão está disponível
- Revise logs de erro no GitHub Actions

## 📝 Checklist de Release

Antes de fazer release, confirme:

- [ ] Código compila sem erros (`npm run compile`)
- [ ] Linter passa (`npm run lint`)
- [ ] Testes passam (`npm test`)
- [ ] Versão atualizada no `package.json`
- [ ] `CHANGELOG.md` atualizado
- [ ] Documentação atualizada
- [ ] Testado no Extension Development Host
- [ ] Todas as features funcionam
- [ ] Secrets configurados no GitHub

## 🔐 Segurança dos Tokens

**NUNCA:**
- Commite tokens no código
- Compartilhe tokens publicamente
- Use tokens em logs

**SEMPRE:**
- Armazene tokens nos GitHub Secrets
- Rotacione tokens periodicamente
- Use tokens com permissões mínimas necessárias

## 📚 Recursos

- [Documentação dos Workflows](.github/WORKFLOWS.md)
- [VS Code Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Open VSX Publishing](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)
- [Semantic Versioning](https://semver.org/)
- [GitHub Actions](https://docs.github.com/en/actions)

## 🎯 Exemplo Completo

```bash
# 1. Atualizar versão
npm version patch

# 2. Editar CHANGELOG.md (adicionar seção [0.0.2])

# 3. Commit
git add package.json CHANGELOG.md
git commit -m "chore: release v0.0.2"

# 4. Push para main
git push origin main

# 5. Aguardar workflows (5-10 minutos)
# - Tag criada automaticamente
# - Publicado no VS Code Marketplace
# - Publicado no Open VSX Registry
# - GitHub Release criado

# 6. Verificar
# - https://marketplace.visualstudio.com/items?itemName=lucasbiel7.yaml-key-replace
# - https://open-vsx.org/extension/lucasbiel7/yaml-key-replace
# - https://github.com/lucasbiel7/yaml-key-replace/releases
```

## 🎉 Pronto!

Sua extensão está publicada e disponível para instalação nos marketplaces!
