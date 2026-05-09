# Como Rodar o Projeto Localmente

## Pré-requisitos

Antes de iniciar, você precisa instalar:

* Node.js
* NPM (já vem junto com o Node.js)

## 1. Instalar o Node.js

Baixe o instalador oficial:

[https://nodejs.org/dist/latest-v22.x/node-v22.15.0-x64.msi](https://nodejs.org/dist/latest-v22.x/node-v22.15.0-x64.msi)

Durante a instalação:

* Clique em `Next`
* Deixe marcada a opção `Add to PATH`
* Finalize a instalação

Depois reinicie o computador.

---

## 2. Verificar instalação

Abra o PowerShell ou CMD e execute:

```bash
node -v
```

Depois:

```bash
npm -v
```

Se aparecer a versão dos dois, está funcionando corretamente.

---

## 3. Baixar ou abrir o projeto

Caso ainda não tenha clonado:

```bash
git clone URL_DO_REPOSITORIO
```

Entrar na pasta do projeto:

```bash
cd mindful-chat-core-main
```

---

## 4. Instalar dependências

Execute:

```bash
npm install
```

Esse comando instala todas as bibliotecas necessárias do projeto.

---

## 5. Rodar o projeto localmente

Execute:

```bash
npm run dev
```

Após iniciar, o terminal exibirá uma URL parecida com:

```txt
http://localhost:5173
```

ou

```txt
http://localhost:8080
```

Abra essa URL no navegador.

---

## 6. Variáveis de ambiente (.env)

O projeto pode utilizar variáveis de ambiente.

Verifique se existe um arquivo:

```txt
.env
```

Caso necessário, adicione suas chaves de API.

Exemplo:

```env
OPENAI_API_KEY=sua-chave
```

---

## Problemas comuns

### Erro: npm não é reconhecido

Significa que o Node.js não foi instalado corretamente ou não foi adicionado ao PATH.

Solução:

* Reinstalar o Node.js
* Reiniciar o computador
* Abrir novamente o terminal

---

### Erro ao instalar dependências

Tente executar:

```bash
npm cache clean --force
npm install
```

---

### Porta já em uso

Caso a porta esteja ocupada:

```bash
npm run dev -- --host
```

ou finalize o processo que está utilizando a porta.

---

## Tecnologias do Projeto

Este projeto utiliza:

* React
* Vite
* TypeScript
* Node.js

---

## Comandos principais

Instalar dependências:

```bash
npm install
```

Rodar ambiente local:

```bash
npm run dev
```

Gerar build:

```bash
npm run build
```

Preview da build:

```bash
npm run preview
```
