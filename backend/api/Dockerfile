FROM mcr.microsoft.com/dotnet/sdk:10.0.302-noble AS build
WORKDIR /source

COPY global.json ./
COPY backend/api/MirajOfIcarus.slnx backend/api/Directory.Build.props ./backend/api/
COPY backend/api/src/Api/MirajOfIcarus.Api.csproj backend/api/src/Api/packages.lock.json ./backend/api/src/Api/
COPY backend/api/src/Application/MirajOfIcarus.Application.csproj backend/api/src/Application/packages.lock.json ./backend/api/src/Application/
COPY backend/api/src/Domain/MirajOfIcarus.Domain.csproj backend/api/src/Domain/packages.lock.json ./backend/api/src/Domain/
COPY backend/api/src/Infrastructure/MirajOfIcarus.Infrastructure.csproj backend/api/src/Infrastructure/packages.lock.json ./backend/api/src/Infrastructure/
COPY backend/api/tests/Api.Tests/MirajOfIcarus.Api.Tests.csproj backend/api/tests/Api.Tests/packages.lock.json ./backend/api/tests/Api.Tests/
COPY backend/game-server/libraries/contracts/MirajOfIcarus.Game.Contracts/MirajOfIcarus.Game.Contracts.csproj backend/game-server/libraries/contracts/MirajOfIcarus.Game.Contracts/packages.lock.json ./backend/game-server/libraries/contracts/MirajOfIcarus.Game.Contracts/
COPY backend/game-server/libraries/runtime/MirajOfIcarus.Game.Runtime/MirajOfIcarus.Game.Runtime.csproj backend/game-server/libraries/runtime/MirajOfIcarus.Game.Runtime/packages.lock.json ./backend/game-server/libraries/runtime/MirajOfIcarus.Game.Runtime/
RUN dotnet restore backend/api/MirajOfIcarus.slnx --locked-mode

COPY backend/api ./backend/api
COPY backend/game-server/libraries/contracts/MirajOfIcarus.Game.Contracts ./backend/game-server/libraries/contracts/MirajOfIcarus.Game.Contracts
COPY backend/game-server/libraries/runtime/MirajOfIcarus.Game.Runtime ./backend/game-server/libraries/runtime/MirajOfIcarus.Game.Runtime
RUN dotnet publish backend/api/src/Api/MirajOfIcarus.Api.csproj \
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
ENTRYPOINT ["dotnet", "MirajOfIcarus.Api.dll"]
