# Snake / Pomar · GPT-6.2 Astra Medium

O experimento propõe a mesma tarefa a diferentes modelos para comparar qualidade da implementação, autonomia, tempo de execução e consumo dos limites do ChatGPT Plus.

## Jogar

Abra `index.html` diretamente em um navegador moderno e selecione **Começar partida**. Use as setas, WASD ou os quatro botões na tela. Cada maçã rende dez pontos e acrescenta um segmento. Bater na cerca ou na própria cobra encerra a partida. Ocupar todas as casas dá a vitória. Use **Jogar novamente** para recomeçar.

## Arquivos e decisões

| Arquivo | Função |
| --- | --- |
| index.html | Tabuleiro, placar, botões e telas de início e término |
| screen.css | Campo quadrado responsivo, peças e controles de toque |
| rules.js | Estados da partida, movimento, colisão, crescimento e sorteio |
| play.js | Entrada do jogador, relógio e atualização da interface |
| rules.test.cjs | Testes de regras com o executor nativo do Node |
| README.md | Execução e registro do experimento |

O campo usa CSS Grid com 18 × 18 casas. A simulação avança uma casa a cada 175 ms. A última direção válida recebida antes do passo determina a curva. O sorteio escolhe diretamente entre as casas livres, inclusive quando sobra apenas uma. As regras funcionam independentemente do DOM, permitindo testar situações difíceis de alcançar manualmente. O navegador carrega scripts clássicos locais e dispensa servidor, pacotes e build.

## Validação e limites

Execute `node --test rules.test.cjs` neste diretório com Node.js 20 ou superior. Os sete testes passaram. Eles cobrem espera e estado inicial, movimento, inversão, crescimento, pontos, todas as posições disponíveis para a comida, quatro paredes, colisão corporal, entrada na posição liberada pela cauda e vitória.

A verificação sintática de play.js e a conferência de IDs e recursos locais do HTML passaram. O Chromium do ambiente encerrou ao tentar criar seu socket de processo. A aparência e a interação em navegador real ficaram sem validação.

A implementação foi escrita nesta pasta sem consultar arquivos de outras variantes. A conversa já continha a execução anterior, o que limita o isolamento experimental entre modelos.

O relógio do ambiente marcou 02:39:30 UTC na primeira verificação e 02:40:42 UTC ao terminar a conferência do HTML em 23/11/2026. Esses 72 segundos abrangem a implementação e as verificações até esse ponto. Documentação final e publicação ocorreram depois. Tokens, custo e consumo da cota Plus ficaram sem medição verificável.
