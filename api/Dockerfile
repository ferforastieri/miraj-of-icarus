FROM mcr.microsoft.com/dotnet/sdk:10.0.302-noble AS build
WORKDIR /source

COPY global.json ./
COPY api/Masicarus.slnx api/Directory.Build.props ./api/
COPY api/src/Masicarus.Api/Masicarus.Api.csproj api/src/Masicarus.Api/packages.lock.json ./api/src/Masicarus.Api/
COPY api/src/Masicarus.Application/Masicarus.Application.csproj api/src/Masicarus.Application/packages.lock.json ./api/src/Masicarus.Application/
COPY api/src/Masicarus.Domain/Masicarus.Domain.csproj api/src/Masicarus.Domain/packages.lock.json ./api/src/Masicarus.Domain/
COPY api/src/Masicarus.Infrastructure/Masicarus.Infrastructure.csproj api/src/Masicarus.Infrastructure/packages.lock.json ./api/src/Masicarus.Infrastructure/
COPY api/tests/Masicarus.Api.Tests/Masicarus.Api.Tests.csproj api/tests/Masicarus.Api.Tests/packages.lock.json ./api/tests/Masicarus.Api.Tests/
COPY game-server/libraries/contracts/Masicarus.Game.Contracts/Masicarus.Game.Contracts.csproj game-server/libraries/contracts/Masicarus.Game.Contracts/packages.lock.json ./game-server/libraries/contracts/Masicarus.Game.Contracts/
RUN dotnet restore api/Masicarus.slnx --locked-mode

COPY api ./api
COPY game-server/libraries/contracts/Masicarus.Game.Contracts ./game-server/libraries/contracts/Masicarus.Game.Contracts
RUN dotnet publish api/src/Masicarus.Api/Masicarus.Api.csproj \
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
