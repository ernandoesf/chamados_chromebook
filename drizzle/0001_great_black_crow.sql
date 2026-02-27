CREATE TABLE `slaRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipoProblema` enum('nao_liga','tela_quebrada','tela_sem_imagem','teclado_defeito','touchpad_defeito','problema_bateria','problema_carregador','sistema_travando','wifi_nao_conecta','outro') NOT NULL,
	`prioridade` enum('baixa','media','alta','critica') NOT NULL,
	`prazoHoras` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `slaRules_id` PRIMARY KEY(`id`),
	CONSTRAINT `slaRules_tipoProblema_unique` UNIQUE(`tipoProblema`)
);
--> statement-breakpoint
CREATE TABLE `ticketHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`statusAnterior` enum('aberto','em_analise','aguardando_peca','em_manutencao','resolvido','cancelado'),
	`statusNovo` enum('aberto','em_analise','aguardando_peca','em_manutencao','resolvido','cancelado') NOT NULL,
	`responsavel` varchar(255) NOT NULL,
	`observacoes` text,
	`dataAlteracao` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticketHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketNumber` varchar(20) NOT NULL,
	`solicitante` varchar(255) NOT NULL,
	`email` varchar(320),
	`unidadeEscolar` varchar(255) NOT NULL,
	`patrimonioChromebook` varchar(100) NOT NULL,
	`numeroSerie` varchar(100),
	`tipoProblema` enum('nao_liga','tela_quebrada','tela_sem_imagem','teclado_defeito','touchpad_defeito','problema_bateria','problema_carregador','sistema_travando','wifi_nao_conecta','outro') NOT NULL,
	`descricaoDetalhada` text NOT NULL,
	`prioridade` enum('baixa','media','alta','critica') NOT NULL,
	`status` enum('aberto','em_analise','aguardando_peca','em_manutencao','resolvido','cancelado') NOT NULL DEFAULT 'aberto',
	`dataAbertura` timestamp NOT NULL DEFAULT (now()),
	`dataResolucao` timestamp,
	`responsavelAtendimento` varchar(255),
	`observacoesSolucao` text,
	`slaVencido` boolean DEFAULT false,
	`dataLimiteSLA` timestamp,
	`tempoAtendimentoMinutos` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `tickets_ticketNumber_unique` UNIQUE(`ticketNumber`)
);
