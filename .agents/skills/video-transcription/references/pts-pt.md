# PTS-PT — Regras propostas para documentação técnica em Português Europeu

**Versão 0.1 — Proposta**

## 1. Objetivo

O Português Técnico Simplificado (PTS-PT) é uma linguagem controlada para documentação técnica em Português Europeu.

Os objetivos são:

- reduzir ambiguidades;
- tornar as instruções mais fáceis de compreender;
- facilitar a tradução;
- tornar a terminologia consistente;
- reduzir erros de interpretação;
- facilitar a utilização por leitores cuja língua materna não é o português;
- melhorar a reutilização de conteúdo técnico.

O PTS-PT segue o princípio fundamental:

**Um conceito → um termo → um significado.**

## 2. Vocabulário

### REGRA 2.1 — Utilize um termo aprovado para cada conceito

Não utilize diferentes palavras para representar o mesmo componente, ação ou conceito.

**Não recomendado**

> Retire a tampa.\
> Remova a cobertura.\
> Volte a instalar a proteção.

Se os três termos identificarem a mesma peça, o texto é ambíguo.

**Recomendado**

> Retire a tampa.\
> Instale a tampa.

Escolha **tampa** como termo aprovado e utilize sempre esse termo.

### REGRA 2.2 — Não utilize sinónimos apenas para evitar repetição

Na escrita literária, a repetição pode ser indesejável. Na escrita técnica, a repetição aumenta a precisão.

**Não recomendado**

> Verifique o cabo. Se o condutor estiver danificado, substitua-o.

**Recomendado**

> Verifique o cabo. Se o cabo estiver danificado, substitua o cabo.

### REGRA 2.3 — Utilize uma palavra com um único significado técnico

Quando uma palavra puder ter vários significados, defina apenas um significado autorizado.

Exemplo: **abrir**. Significado aprovado: mover um componente para a posição aberta.

> Abra a válvula.\
> Abra a porta.

Não utilize **abrir** com outros significados quando existir um verbo mais preciso.

**Não recomendado**

> Abra o programa.

**Preferível**

> Inicie o programa.

### REGRA 2.4 — Prefira palavras comuns e concretas

- Prefira **usar** em vez de **utilizar** quando não existir uma razão terminológica para utilizar **utilizar**.
- Prefira **antes de** em vez de **previamente a**.
- Prefira **depois de** em vez de **subsequentemente a**.
- Prefira **para** em vez de **com o objetivo de**.

### REGRA 2.5 — Evite linguagem vaga

Evite palavras como adequado, aproximadamente, considerável, eventualmente, normalmente, possivelmente, relativamente, suficiente e apropriado, quando puder fornecer informação objetiva.

**Não recomendado**

> Aperte suficientemente o parafuso.

**Recomendado**

> Aperte o parafuso a 25 N·m.

## 3. Terminologia técnica

### REGRA 3.1 — Crie um dicionário de termos aprovados

Cada termo deve incluir, quando aplicável: termo aprovado, classe gramatical, significado autorizado, termos proibidos ou não preferenciais, exemplo e domínio técnico.

| Termo aprovado | Classe | Significado                                           | Não utilizar          |
| -------------- | ------ | ----------------------------------------------------- | --------------------- |
| retirar        | verbo  | remover um componente da sua posição                  | sacar, extrair, tirar |
| instalar       | verbo  | colocar um componente na sua posição de funcionamento | montar, pôr           |
| desligar       | verbo  | interromper alimentação ou funcionamento              | apagar, cortar        |
| verificar      | verbo  | examinar para determinar uma condição                 | checar                |
| avaria         | nome   | condição que impede o funcionamento especificado      | problema, falha\*     |

\* Podem ser termos diferentes se a organização lhes atribuir significados técnicos diferentes.

## 4. Frases

### REGRA 4.1 — Escreva frases curtas

- **Instruções:** máximo de 20 palavras.
- **Texto descritivo:** máximo de 25 palavras.

Não conte títulos, referências de peças ou identificadores técnicos como palavras quando isso prejudicar artificialmente a regra.

### REGRA 4.2 — Expresse, de preferência, uma ação principal por frase

**Não recomendado**

> Retire a tampa, verifique o filtro e, se este estiver sujo, limpe-o antes de voltar a montar o conjunto.

**Recomendado**

> 1. Retire a tampa.
> 2. Verifique o filtro.
> 3. Se o filtro estiver sujo, limpe o filtro.
> 4. Instale a tampa.

### REGRA 4.3 — Coloque a condição antes da ação

**Preferível**

> Se a pressão for inferior a 2 bar, desligue a bomba.

em vez de:

> Desligue a bomba se a pressão for inferior a 2 bar.

### REGRA 4.4 — Não coloque várias condições numa frase complexa

**Não recomendado**

> Se a luz estiver apagada e o motor não funcionar quando o interruptor estiver na posição ON, verifique o fusível.

**Recomendado**

> 1. Coloque o interruptor na posição ON.
> 2. Verifique a luz.
> 3. Se a luz estiver apagada, verifique o fusível.

## 5. Verbos

### REGRA 5.1 — Utilize o imperativo nas instruções

Para documentação dirigida ao utilizador, utilize de forma consistente o imperativo formal do Português Europeu: «Prima o botão START.», «Retire o filtro.», «Feche a válvula.». Não alterne entre «Premir o botão.», «Deve premir o botão.» e «Prima o botão.». Para procedimentos, prefira **Prima o botão.**

### REGRA 5.2 — Utilize o infinitivo principalmente em títulos ou etiquetas

Título: «Instalar o filtro». Procedimento: «Instale o filtro.»

### REGRA 5.3 — Evite cadeias de verbos abstratos

| Não recomendado                               | Recomendado           |
| --------------------------------------------- | --------------------- |
| Proceda à realização da verificação do nível. | Verifique o nível.    |
| Efetue a remoção da tampa.                    | Retire a tampa.       |
| Proceda ao acionamento do interruptor.        | Acione o interruptor. |

### REGRA 5.4 — Evite nominalizações quando existir um verbo simples

Prefira **verifique** a **efetue uma verificação**, **instale** a **efetue a instalação** e **limpe** a **proceda à limpeza**.

## 6. Tempos verbais

### REGRA 6.1 — Utilize principalmente o presente

> A válvula controla o fluxo de combustível.

### REGRA 6.2 — Utilize o futuro apenas quando a sequência temporal for importante

**Menos recomendado:** «O indicador irá acender quando o sistema atingir 80 °C.»
**Preferível:** «O indicador acende quando o sistema atinge 80 °C.»

### REGRA 6.3 — Evite o gerúndio em instruções

**Não recomendado:** «Retire o filtro, verificando se existem danos.»
**Recomendado:** «Retire o filtro. Verifique se o filtro apresenta danos.»

## 7. Voz ativa e voz passiva

### REGRA 7.1 — Prefira a voz ativa

**Não recomendado:** «O filtro deve ser retirado pelo técnico.»
**Recomendado:** «O técnico deve retirar o filtro.» Em procedimentos dirigidos ao técnico: «Retire o filtro.»

### REGRA 7.2 — Utilize a voz passiva apenas quando o agente não for importante

Aceitável: «O equipamento é alimentado por uma fonte de 24 V CC.»

### REGRA 7.3 — Tenha cuidado com construções com «se»

«verifica-se», «procede-se», «deve-se» e «instala-se» podem ocultar o agente responsável.

**Não recomendado:** «Deve-se verificar a pressão.»
**Recomendado:** «Verifique a pressão.» ou, quando o agente for importante, «O técnico deve verificar a pressão.»

## 8. Pronomes

### REGRA 8.1 — Utilize um pronome apenas quando o referente for inequívoco

**Ambíguo:** «Retire o filtro da bomba e verifique se está danificado.» (o filtro ou a bomba?)
**Recomendado:** «Retire o filtro da bomba. Verifique se o filtro está danificado.»

### REGRA 8.2 — Repita o nome quando existir risco de ambiguidade

**Não recomendado:** «Retire a tampa e coloque-a junto da unidade. Não a ligue.»
**Recomendado:** «Retire a tampa. Coloque a tampa junto da unidade. Não ligue a unidade.»

### REGRA 8.3 — Evite «este», «esta», «isso», «aquilo» quando o referente não for imediato

**Não recomendado:** «Isto pode causar danos.»
**Recomendado:** «A pressão excessiva pode danificar a bomba.»

## 9. Coordenação

### REGRA 9.1 — Limite o uso de «e» e «ou»

**Não recomendado:** «Abra a porta e retire a tampa e desligue o cabo e verifique o conector.»
**Recomendado:** uma ação por passo numerado.

### REGRA 9.2 — Não utilize «e/ou»

**Não recomendado:** «Substitua o cabo e/ou o conector.»
**Recomendado:** «Se o cabo estiver danificado, substitua o cabo. Se o conector estiver danificado, substitua o conector.»

## 10. Negação

### REGRA 10.1 — Utilize instruções positivas quando possível

**Menos recomendado:** «Não deixe a válvula aberta.» **Preferível:** «Feche a válvula.»

### REGRA 10.2 — Utilize «não» quando a proibição for importante

«Não ligue a alimentação.» «Não toque nos terminais.» Uma proibição de segurança deve ser explícita.

## 11. Números e unidades

### REGRA 11.1 — Utilize valores específicos

**Não recomendado:** «Aguarde alguns minutos.» **Recomendado:** «Aguarde 5 minutos.»

### REGRA 11.2 — Utilize unidades normalizadas

Exemplos: 25 N·m, 24 V CC, 10 mm, 5 °C, 3 bar. Mantenha o mesmo formato em todo o documento.

### REGRA 11.3 — Não substitua limites técnicos por palavras vagas

**Não recomendado:** «Não aqueça demasiado o componente.»
**Recomendado:** «Não aqueça o componente acima de 80 °C.»

## 12. Referências espaciais

### REGRA 12.1 — Utilize referências inequívocas

«esquerda», «direita», «frente» e «atrás» devem ter um ponto de referência definido, por exemplo «lado esquerdo da unidade, visto a partir do painel frontal». Depois de definida a orientação, utilize sempre a mesma referência.

### REGRA 12.2 — Evite «acima», «abaixo», «aqui» e «ali» para referências documentais

**Não recomendado:** «Consulte a figura acima.» **Recomendado:** «Consulte a Figura 12.»

## 13. Abreviaturas e siglas

### REGRA 13.1 — Defina uma sigla na primeira ocorrência

«unidade de controlo eletrónico (ECU)»; depois, «ECU».

### REGRA 13.2 — Não crie variantes da mesma sigla

Se o termo aprovado for «ECU», não alterne com «UCE», «unidade ECU» ou «controlador», salvo se forem conceitos tecnicamente diferentes.

## 14. Avisos de segurança

A terminologia de segurança deve respeitar as normas aplicáveis ao produto e ao setor. Uma mensagem tem a sequência: **palavra de sinalização**, **perigo**, **consequência**, **ação preventiva**.

> **AVISO**\
> Existe tensão elétrica nos terminais.\
> O contacto com os terminais pode causar ferimentos graves.\
> Desligue a alimentação antes de retirar a tampa.

### REGRA 14.1 — Não esconda uma instrução de segurança numa frase longa

### REGRA 14.2 — Identifique o perigo explicitamente

**Fraco:** «Tenha cuidado.» **Melhor:** «A superfície está quente.» **Mais preciso:** «A superfície pode atingir 120 °C. Não toque na superfície até a temperatura ser inferior a 40 °C.»

## 15. Notas

Utilize **NOTA** apenas para informação adicional que ajuda a executar uma tarefa. Uma nota não deve conter uma instrução de segurança crítica.

## 16. Procedimentos

Estrutura: título, objetivo da tarefa, pré-requisitos, ferramentas, procedimento (uma ação principal por passo) e resultado (estado esperado depois da tarefa).

## 17. Palavras e construções a evitar

| Evite                   | Utilize                               |
| ----------------------- | ------------------------------------- |
| a fim de                | para                                  |
| no caso de              | se                                    |
| proceder a              | o verbo que identifica a ação         |
| levar a cabo            | executar, instalar, verificar, testar |
| efetuar uma verificação | verificar                             |
| ter em consideração     | considerar                            |
| com vista a             | para                                  |
| o mesmo / a mesma       | repita o nome                         |

## 18. Exemplos de conversão

| Português técnico convencional                                                                                                                   | PTS-PT                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Após ter procedido à remoção da cobertura, deverá efetuar uma inspeção visual da mesma com vista a verificar a existência de eventuais danos.    | Retire a tampa. Verifique se a tampa apresenta danos.                  |
| Caso seja verificada a existência de uma fuga, a unidade deverá ser imediatamente desligada.                                                     | Se existir uma fuga, desligue imediatamente a unidade.                 |
| Antes de se proceder à realização de qualquer trabalho de manutenção, deverá assegurar-se que o equipamento se encontra completamente desligado. | Antes de iniciar a manutenção, desligue o equipamento.                 |
| Não deverá proceder à utilização do equipamento caso seja detetada qualquer anomalia no cabo de alimentação.                                     | Não utilize o equipamento se o cabo de alimentação estiver danificado. |
| O operador deverá certificar-se de que todos os elementos de fixação se encontram devidamente apertados.                                         | Verifique o aperto de todos os elementos de fixação.                   |

## 19. Regras essenciais resumidas

1. Utilize um termo para cada conceito.
2. Utilize cada termo com um significado definido.
3. Não utilize sinónimos desnecessários.
4. Prefira palavras comuns e concretas.
5. Escreva instruções com, no máximo, 20 palavras sempre que possível.
6. Escreva frases descritivas com, no máximo, 25 palavras sempre que possível.
7. Coloque uma ação principal em cada passo.
8. Utilize o imperativo nas instruções.
9. Prefira a voz ativa.
10. Evite nominalizações.
11. Evite o gerúndio quando a sequência das ações puder ser ambígua.
12. Coloque condições antes das ações.
13. Repita o nome quando um pronome puder ser ambíguo.
14. Utilize números e limites específicos.
15. Evite palavras vagas.
16. Identifique explicitamente perigos e consequências.
17. Utilize referências estáveis para figuras, tabelas e secções.
18. Defina todas as siglas.
19. Utilize sempre a mesma terminologia.
20. Prefira precisão a variedade estilística.

## 20. Regra principal de decisão

Quando existirem duas formas gramaticalmente corretas de transmitir a mesma informação, escolha a forma que tenha:

1. menos interpretações possíveis;
2. menos palavras;
3. estrutura mais simples;
4. terminologia já aprovada;
5. ação mais explícita.

**A consistência é mais importante do que a elegância estilística.**
