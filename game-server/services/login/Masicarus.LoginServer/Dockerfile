FROM mcr.microsoft.com/dotnet/sdk:10.0.302-noble AS build
WORKDIR /source
COPY global.json ./
COPY game-server ./game-server
RUN dotnet restore game-server/services/login/Masicarus.LoginServer/Masicarus.LoginServer.csproj --locked-mode
RUN dotnet publish game-server/services/login/Masicarus.LoginServer/Masicarus.LoginServer.csproj \
    --configuration Release --no-restore --output /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0.10-noble AS runtime
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
COPY --from=build /app/publish .
USER $APP_UID
ENTRYPOINT ["dotnet", "Masicarus.LoginServer.dll"]
