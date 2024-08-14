

# LojaApp

Este projeto foi gerado com [Angular CLI](https://github.com/angular/angular-cli) versão 18.1.4.

## Objetivo

Criar um projeto Angular que permita gerenciar pedidos de uma loja.

## Funcionalidades

- **Listar Pedidos:**
  - Exibir todos os pedidos registrados.

- **Iniciar Novo Pedido:**
  - Permitir ao usuário iniciar um novo pedido.

- **Adicionar Produto:**
  - Permitir ao usuário adicionar produtos ao pedido.

- **Remover Produto:**
  - Permitir ao usuário remover produtos do pedido.

- **Fechar Pedido:**
  - Permitir ao usuário fechar o pedido.

## Regras de Negócio

- Produtos não podem ser adicionados/removidos em pedidos fechados.
- Um pedido só pode ser fechado se contiver pelo menos um produto.
- O produto deve conter uma descrição de no máximo 50 caracteres.
- Quando um pedido é excluído, os produtos são devolvidos à loja.
- Ao fechar um pedido, todas as ações são bloqueadas.
- A edição dos pedidos atualiza a loja, adicionando ou removendo produtos da lista de pedidos.

## Condições

- **Backend:**
  - Para simplicidade, os dados são armazenados numa lista em memória.
  - Dados são retornados em observables para simular chamadas assíncronas.

## Regras de Implementação

- Implementação de notificações para atualizar as listas quando algum valor é mudado.
- Armazenamento de dados utilizando `localStorage` para persistência.

## Setup

Para instalar as dependências do projeto, execute:

##bash
npm install

# LojaApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.1.4.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
