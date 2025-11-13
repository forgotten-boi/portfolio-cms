# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files
COPY ["src/Portfolio.Api/Portfolio.Api.csproj", "Portfolio.Api/"]
COPY ["src/Portfolio.Infrastructure/Portfolio.Infrastructure.csproj", "Portfolio.Infrastructure/"]
COPY ["src/Portfolio.Application/Portfolio.Application.csproj", "Portfolio.Application/"]
COPY ["src/Portfolio.Domain/Portfolio.Domain.csproj", "Portfolio.Domain/"]

# Restore dependencies
RUN dotnet restore "Portfolio.Api/Portfolio.Api.csproj"

# Copy all source files
COPY src/ .

# Build
WORKDIR "/src/Portfolio.Api"
RUN dotnet build "Portfolio.Api.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "Portfolio.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

EXPOSE 8080

# Copy published files
COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "Portfolio.Api.dll"]
