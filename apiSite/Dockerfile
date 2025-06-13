FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Usar o root para instalar pacotes
USER root

# Instalar tzdata e configurar o fuso horário
RUN apt-get update && apt-get install -y tzdata

# Configurar o fuso horário para 'America/Sao_Paulo'
ENV TZ=America/Sao_Paulo

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["apiSite.csproj", "."]
RUN dotnet restore "./apiSite.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "./apiSite.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./apiSite.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "apiSite.dll"]