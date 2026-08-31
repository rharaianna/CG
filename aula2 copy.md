# 🌸 Compiladores | Aula 1: Introdução (Completo) ✨

> **Professor:** Marcelo Bernardes Vieira  
> **Bibliografia Básica:** "Compilers" (Aho, Sethi, Ullman) e "Modern Compiler Implementation" (Appel e Palsberg).

---

## 📌 1. Conceitos Fundamentais
* **Compilador:** Traduz um código-fonte para um programa executável de baixo nível (que seja mais otimizável). Exige conhecimento da máquina alvo.
* **Interpretador:** Lê o código fonte e já produz os resultados da execução na hora (não gera um executável separado).

---

## 🌍 2. O "Microcosmo" da Ciência da Computação
Construir compiladores une praticamente todas as áreas do curso:
* **Otimização / Inteligência:** Métodos gulosos, algoritmos de aprendizado, grafos, programação dinâmica.
* **Teoria da Computação:** Linguagens, Autômatos (AFD), Geradores de Parser, Teoria de Reticulados.
* **Sistemas e Arquitetura:** Localidade, alocação, sincronização, pipelines, hierarquias de memória, conjuntos de instruções.
* **Desafio Constante:** Mudanças na arquitetura exigem mudanças no compilador (e vice-versa).

---

## 💖 3. Os 10 Mandamentos de um Bom Compilador
1. Código gerado precisa ser **estritamente correto**.
2. A saída final deve executar rápido.
3. O processo de compilar deve ser rápido.
4. Tempo de compilação proporcional ao tamanho do código de entrada.
5. Suporte a compilação em separado.
6. Bons diagnósticos de erros (mensagens claras).
7. Funcionar bem com o debugador.
8. Bons diagnósticos para problemas de fluxo de controle.
9. Suporte a chamadas entre linguagens.
10. Otimização consistente e previsível.

---

## 🏗️ 4. A Arquitetura e a Falácia $M \times N$
* **O Problema:** Se temos $M$ linguagens fonte e $N$ máquinas alvo, precisaríamos escrever $M \times N$ compiladores inteiros do zero?
* **A Solução:** Usar uma **Representação Intermediária (R.I.)** comum. Assim, criamos um modelo de $M + N$ componentes (vários *Front Ends* conectando na mesma R.I., e vários *Back Ends* lendo dessa R.I.).
* **A Falácia:** Na prática, é quase impossível ter uma R.I. 100% universal. Projetos assim costumam ter sucesso limitado com R.I. de baixo nível.

---

## 🛠️ 5. As 3 Fases do Compilador Moderno

### 🔍 A. Front End (Fase Analítica)
Depende *apenas* da linguagem fonte. Sua complexidade matemática é leve: $O(n)$ ou $O(n \log n)$.
* **Analisador Léxico (Scanner):**
  * Transforma texto ASCII em ==Tokens== (a unidade básica, ex: ID, NUM, +).
  * ==Lexema:== É a string real e exata associada àquele Token.
  * Otimiza removendo espaços em branco e comentários. Velocidade aqui importa muito.
* **Analisador Sintático (Parser):**
  * Verifica a estrutura usando **Gramáticas Livres de Contexto (BNF)**.
  * **Hierarquia de Chomsky:**
    * Tipo 3 (Regulares): Resolvido via AFD (Análise Léxica).
    * Tipo 2 (Livres de Contexto): Autômato de Pilha (Análise Sintática).
    * Tipo 1 (Sensível ao contexto): Máquina de Turing Limitada.
    * Tipo 0 (Irrestrita): Máquina de Turing.
  * **Gramática Formal:** Definida como $G=(S,N,T,P)$, onde S = Inicial, N = Não-terminais, T = Terminais, P = Produções ($N \rightarrow (N \cup T)*$).
* **Árvore de Derivação vs AST:** O parser inicialmente gera uma árvore de sintaxe cheia de informações, mas com muitos "nós" desnecessários. A **Árvore Sintática Abstrata (AST)** retira os nós não-terminais, ficando muito mais concisa. É ela que usamos como R.I.!

### ✨ B. Middle End (Otimizador)
Analisa e altera a R.I. para reduzir drasticamente o tempo de execução, mas preservando o resultado original.
* **Passos/Truques Típicos:** 
  * Propagação e redução de constantes.
  * Movimentação de código.
  * Redução de força de operadores (trocar uma multiplicação cara por uma soma rápida).
  * Eliminação de sub-expressões comuns.
  * Eliminação de "stores" redundantes e eliminação de **código morto**.

### 🤖 C. Back End (Fase Sintética)
Depende *apenas* da máquina alvo. É a fase mais complexa da computação, classificada como **NP-Completo**.
* **Seleção de Instruções:** Usa reconhecimento de padrões (casamento de árvores/sequências) e *programação dinâmica* para escolher instruções gerando um código compacto e rápido.
* **Alocação de Registradores:** Como os registradores da CPU são um recurso extremamente limitado, ele precisa decidir o que vai ficar lá. Para $k$ registradores, alocar perfeitamente é NP-Completo! Eles resolvem isso usando analogias com **Coloração de Grafos**.
