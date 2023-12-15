# Bruno Meira | Avaliação 2023-2B P2

O código tem vulnerabilidades e práticas inseguras que precisam ser corrigidas. Vou identificar cada uma delas e descrever a correção feita.

1. **SQL Injection no Endpoint de Criação de Cachorro e Gato:**
   - **Vulnerabilidade:** A inserção direta de dados do usuário na string SQL (`INSERT INTO cats`) permite ataques de injeção de SQL.
   - **Medida corretiva:** Implementação de consultas com parametros para evitar a injeção de SQL.

2. **SQL Injection no Endpoint de Votação:**
   - **Vulnerabilidade:** A concatenação direta de strings em `UPDATE ${animalType} SET` pode levar a ataques de injeção de SQL.
   - **Medida corretiva:** Implementação de consultas com parametros para evitar a injeção de SQL.

3. **Validação de Entrada Insuficiente:**
   - **Vulnerabilidade:** Falta de validação para garantir que `animalType` seja 'cats' ou 'dogs' no endpoint de votação, que `name` seja uma string e que o `id` seja um número e seja maior que 0, além da verificação se o registro realmente existe antes do update.
   - **Medida corretiva:** Implementação de uma validação para garantir que `animalType` seja um valor esperado, que o `name` seja um valor esperado e que o `id` seja um valor esperado e o registro dele exista na tabela.

4. **Exposição de Informações Sensíveis:**
   - **Vulnerabilidade:** Exposição completa de erros, incluindo mensagens sensíveis, no middleware de erro indo diretamente como resposta para o cliente.
   - **Medida corretiva:** Implementação de uma mensagem genérica de erro para o cliente e print no log detalhes apenas no ambiente de desenvolvimento.

5. **Metódos Faltantes:**
   - **Vulnerabilidade:** O código tinha metódos de endpoints faltantes.
   - **Medida corretiva:** Implementação desses metódos seguindo, também, as vulnerabilidades anteriores 
