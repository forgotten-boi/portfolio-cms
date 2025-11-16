using Aspire.Hosting;
using System.IO;
using Microsoft.Extensions.Configuration;

var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddContainer("postgres", "postgres", "17")
    .WithEnvironment("POSTGRES_USER", "portfolio_user")
    .WithEnvironment("POSTGRES_PASSWORD", "portfolio_pass")
    .WithEnvironment("POSTGRES_DB", "portfolio_db")
    .WithEndpoint(5432, 5432, isProxied: false);

var pgAdmin = builder.AddContainer("pgadmin", "dpage/pgadmin4")
    .WithEnvironment("PGADMIN_DEFAULT_EMAIL", "admin@portfolio.local")
    .WithEnvironment("PGADMIN_DEFAULT_PASSWORD", "admin")
    .WithEndpoint(80, 5050, isProxied: false);

// zookeeper container is created only when Kafka is enabled (mock=false)

// Kafka & Zookeeper are only included when not running with USE_MOCKS(true)
var useMocks = builder.Configuration.GetValue<bool>("USE_MOCKS", false);

var zookeeper = (useMocks) ? null : builder.AddContainer("zookeeper", "confluentinc/cp-zookeeper", "7.5.0")
    .WithEnvironment("ZOOKEEPER_CLIENT_PORT", "2181")
    .WithEnvironment("ZOOKEEPER_TICK_TIME", "2000")
    .WithEndpoint(2181, 2181, isProxied: false);

var kafka = (useMocks) ? null : builder.AddContainer("kafka", "confluentinc/cp-kafka", "7.5.0")
    .WithEnvironment("KAFKA_BROKER_ID", "1")
    .WithEnvironment("KAFKA_ZOOKEEPER_CONNECT", "zookeeper:2181")
    .WithEnvironment("KAFKA_ADVERTISED_LISTENERS", "PLAINTEXT://kafka:9092")
    .WithEnvironment("KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR", "1")
    .WithEndpoint(9092, 9092, isProxied: false);

// Redis is optional: start in non-mock mode only
var redis = useMocks ? null : builder.AddContainer("redis", "redis", "7-alpine")
    .WithEnvironment("REDIS_PASSWORD", "redis_dev_password")
    .WithEndpoint(6379, 6379, isProxied: false);

var apiProjectPath = Path.Combine("..", "Portfolio.Api", "Portfolio.Api.csproj");

var api = builder.AddProject("portfolio-api", apiProjectPath)
    .WithEnvironment("ConnectionStrings__DefaultConnection", "Host=postgres;Port=5432;Database=portfolio_db;Username=portfolio_user;Password=portfolio_pass")
    .WithEnvironment("Kafka__Enabled", useMocks ? "false" : "true")
    .WithEnvironment("Kafka__BootstrapServers", "kafka:9092")
    .WithEnvironment("Redis__ConnectionString", "redis:6379")
    .WithEnvironment("USE_MOCKS", useMocks ? "true" : "false")
    .WithEnvironment("ASPNETCORE_URLS", "http://+:8085");

// Frontend - use built image portfolio-frontend:latest if available (build handled by dockerfile and build scripts).  
// Serve the frontend on port 80 inside container mapped to host 4200 (to match docker-compose)
var frontend = builder.AddContainer("frontend", "portfolio-frontend", "latest")
    .WithEnvironment("API_URL", "http://portfolio-api:8085")
    .WithEnvironment("USE_MOCKS", useMocks ? "true" : "false")
    .WithEndpoint(80, 4200, isProxied: false)
    .WithReference(api);

builder.Build().Run();
