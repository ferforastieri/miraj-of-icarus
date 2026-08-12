FROM mcr.microsoft.com/dotnet/sdk:10.0.302-noble AS build
WORKDIR /source

COPY global.json ./
COPY api/Masicarus.slnx api/Directory.Build.props ./api/
COPY api/src/Api/Masicarus.Api.csproj api/src/Api/packages.lock.json ./api/src/Api/
COPY api/src/Application/Masicarus.Application.csproj api/src/Application/packages.lock.json ./api/src/Application/
COPY api/src/Domain/Masicarus.Domain.csproj api/src/Domain/packages.lock.json ./api/src/Domain/
COPY api/src/Infrastructure/Masicarus.Infrastructure.csproj api/src/Infrastructure/packages.lock.json ./api/src/Infrastructure/
COPY api/tests/Api.Tests/Masicarus.Api.Tests.csproj api/tests/Api.Tests/packages.lock.json ./api/tests/Api.Tests/
COPY game-server/libraries/contracts/Masicarus.Game.Contracts/Masicarus.Game.Contracts.csproj game-server/libraries/contracts/Masicarus.Game.Contracts/packages.lock.json ./game-server/libraries/contracts/Masicarus.Game.Contracts/
COPY game-server/libraries/runtime/Masicarus.Game.Runtime/Masicarus.Game.Runtime.csproj game-server/libraries/runtime/Masicarus.Game.Runtime/packages.lock.json ./game-server/libraries/runtime/Masicarus.Game.Runtime/
RUN dotnet restore api/Masicarus.slnx --locked-mode

COPY api ./api
COPY game-server/libraries/contracts/Masicarus.Game.Contracts ./game-server/libraries/contracts/Masicarus.Game.Contracts
COPY game-server/libraries/runtime/Masicarus.Game.Runtime ./game-server/libraries/runtime/Masicarus.Game.Runtime
RUN dotnet publish api/src/Api/Masicarus.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0.10-noble AS runtime
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
COPY --from=build /app/publish .
USER $APP_UID
ENTRYPOINT ["dotnet", "Masicarus.Api.dll"]
