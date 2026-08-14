# Cliente mobile

Espaço reservado ao futuro cliente móvel do Miraj of Icarus. Ele pertence à
experiência do jogo e é separado do aplicativo móvel do portal.

## Limites do módulo

- renderização e interação do jogo em plataformas móveis;
- integração com Login, Main/Coordinator e Lobby pelos contratos oficiais;
- assets e otimizações específicos de dispositivo;
- nenhuma escrita direta em PostgreSQL ou Redis.

## Desenvolvimento

Ainda não há engine, toolchain ou comandos de build definidos nesta pasta.
Quando a implementação começar, este README deverá documentar plataformas
suportadas, SDKs, execução, testes, empacotamento e distribuição.

Credenciais e tokens deverão permanecer em memória ou em armazenamento seguro
da plataforma, conforme a finalidade da sessão.
