# Chromebook Help Desk - TODO

## Fase 1: Arquitetura e Banco de Dados
- [x] Definir schema do banco de dados (tickets, users, sla_rules)
- [x] Configurar tipos e enums (status, prioridade, tipo de problema)
- [x] Implementar fórmulas de cálculo automático (SLA, tempo decorrido)

## Fase 2: Formulário de Abertura de Chamados
- [x] Criar componente de formulário com validação
- [x] Implementar auto-incremento de número de chamado
- [x] Adicionar data/hora automática de abertura
- [x] Implementar seleção de tipo de problema com prioridade automática
- [x] Validar campos obrigatórios

## Fase 3: Base de Chamados
- [x] Criar tabela de visualização de chamados
- [ ] Implementar colunas calculadas (tempo decorrido, status SLA)
- [ ] Adicionar formatação condicional por status
- [x] Implementar filtros por período, unidade, tipo, status, solicitante, patrimônio
- [x] Implementar busca avançada

## Fase 4: Dashboard Executivo
- [x] Criar indicadores-chave (total abertos, resolvidos, taxa resolução, tempo médio, fora do SLA)
- [x] Implementar gráfico de distribuição por tipo de problema
- [x] Implementar gráfico de chamados por unidade escolar
- [x] Implementar gráfico de evolução temporal (abertura vs resolução)
- [x] Implementar gráfico de status de SLA

## Fase 5: Sistema de SLA
- [x] Configurar regras de SLA por tipo de problema (crítico 4h, alto 8h, médio 24h, baixo 48h)
- [x] Implementar cálculo automático de prazo de SLA
- [x] Implementar alertas visuais para chamados vencidos
- [x] Implementar lógica de notificação por email para SLA vencido
- [x] Implementar lógica de notificação para chamados críticos sem atendimento há 2h

## Fase 6: Atualização de Status
- [x] Criar interface de atualização de status de chamados
- [x] Registrar data/hora de resolução
- [x] Registrar responsável pelo atendimento
- [x] Adicionar campo de observações da solução

## Fase 7: Exportação de Relatórios
- [x] Implementar exportação em CSV
- [x] Implementar exportação em JSON
- [x] Incluir dados filtrados da base de chamados
- [x] Incluir métricas do dashboard

## Fase 8: Design Visual - Planta Arquitetônica
- [x] Aplicar fundo azul royal profundo
- [x] Adicionar padrão de grade técnica sutil
- [x] Implementar desenhos de linhas técnicas brancas
- [x] Adicionar marcadores de dimensão e molduras retangulares (estilo CAD)
- [x] Aplicar tipografia sans-serif branca e negrita
- [x] Criar hierarquia visual limpa e estruturada

## Fase 9: Testes e Validação
- [x] Testar formulário de abertura
- [x] Testar cálculos de SLA
- [x] Testar filtros e busca
- [x] Testar exportação de relatórios
- [x] Testar notificações por email
- [x] Validar design visual em diferentes resoluções
