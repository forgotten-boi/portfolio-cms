using Docker.DotNet;
using Docker.DotNet.Models;
using Microsoft.Extensions.Configuration;
using System.Diagnostics;
using System.Runtime.InteropServices;

var builder = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: true)
    .AddEnvironmentVariables()
    .Build();

var useMocks = builder.GetValue<bool>("USE_MOCKS", false);

Console.WriteLine("=======================================================");
Console.WriteLine("  Portfolio CMS - Orchestration Host");
Console.WriteLine("=======================================================");
Console.WriteLine($"Mock Mode: {(useMocks ? "ENABLED" : "DISABLED")}");
Console.WriteLine("-------------------------------------------------------");

var cancellationTokenSource = new CancellationTokenSource();
Console.CancelKeyPress += (sender, e) =>
{
    e.Cancel = true;
    cancellationTokenSource.Cancel();
};

var tasks = new List<Task>();

try
{
    // Docker client for container management
    var dockerClient = new DockerClientConfiguration().CreateClient();

    // Get project root - handle both running from AppHost dir and root dir
    var currentDir = Directory.GetCurrentDirectory();
    string rootDir;
    
    // Check if we're in the AppHost project directory
    if (currentDir.EndsWith("Portfolio.AppHost", StringComparison.OrdinalIgnoreCase))
    {
        // 3 levels up from AppHost project: AppHost -> src -> portfolio.api -> root
        var srcDir = Path.GetFullPath(Path.Combine(currentDir, ".."));
        var apiDir = Path.GetFullPath(Path.Combine(srcDir, ".."));
        rootDir = Path.GetFullPath(Path.Combine(apiDir, ".."));
    }
    else
    {
        // Assume we're at root or need to find it
        rootDir = currentDir;
        while (!File.Exists(Path.Combine(rootDir, "INSTRUCTIONS.md")) && 
               !string.IsNullOrEmpty(Path.GetDirectoryName(rootDir)))
        {
            rootDir = Path.GetDirectoryName(rootDir)!;
        }
    }
    
    var frontendDir = Path.Combine(rootDir, "portfolio-cms-web");
    var apiProjectPath = Path.Combine(rootDir, "portfolio.api", "src", "Portfolio.Api");

    Console.WriteLine($"\nProject paths:");
    Console.WriteLine($"  Root: {rootDir}");
    Console.WriteLine($"  API: {apiProjectPath}");
    Console.WriteLine($"  Frontend: {frontendDir}");
    Console.WriteLine();

    // Step 1: Build frontend image if not exists or rebuild
    Console.WriteLine("[1/7] Checking frontend image...");
    var frontendImageExists = false;
    try
    {
        var images = await dockerClient.Images.ListImagesAsync(new ImagesListParameters
        {
            Filters = new Dictionary<string, IDictionary<string, bool>>
            {
                ["reference"] = new Dictionary<string, bool> { ["portfolio-frontend:latest"] = true }
            }
        });
        frontendImageExists = images.Count > 0;
    }
    catch { }

    if (!frontendImageExists || Environment.GetEnvironmentVariable("REBUILD_FRONTEND") == "true")
    {
        Console.WriteLine("  Building frontend Docker image...");
        var dockerBuildProcess = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = "docker",
                Arguments = $"build -t portfolio-frontend:latest -f Dockerfile .",
                WorkingDirectory = frontendDir,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            }
        };

        dockerBuildProcess.Start();
        var buildOutput = await dockerBuildProcess.StandardOutput.ReadToEndAsync();
        var buildError = await dockerBuildProcess.StandardError.ReadToEndAsync();
        await dockerBuildProcess.WaitForExitAsync(cancellationTokenSource.Token);

        if (dockerBuildProcess.ExitCode != 0)
        {
            Console.WriteLine($"  ❌ Frontend build failed: {buildError}");
            throw new Exception($"Frontend Docker build failed with exit code {dockerBuildProcess.ExitCode}");
        }
        Console.WriteLine("  ✅ Frontend image built successfully");
    }
    else
    {
        Console.WriteLine("  ✅ Frontend image already exists (set REBUILD_FRONTEND=true to rebuild)");
    }

    // Step 2: Start PostgreSQL
    Console.WriteLine("\n[2/7] Starting PostgreSQL...");
    var postgresContainer = await StartContainerAsync(dockerClient, new CreateContainerParameters
    {
        Image = "postgres:17",
        Name = "portfolio-postgres-aspire",
        Env = new List<string>
        {
            "POSTGRES_USER=portfolio_user",
            "POSTGRES_PASSWORD=portfolio_pass",
            "POSTGRES_DB=portfolio_db"
        },
        HostConfig = new HostConfig
        {
            PortBindings = new Dictionary<string, IList<PortBinding>>
            {
                ["5432/tcp"] = new List<PortBinding> { new() { HostPort = "5432" } }
            },
            AutoRemove = true
        }
    });
    Console.WriteLine($"  ✅ PostgreSQL started (ID: {postgresContainer[..12]})");

    // Step 3: Start pgAdmin
    Console.WriteLine("\n[3/7] Starting pgAdmin...");
    var pgAdminContainer = await StartContainerAsync(dockerClient, new CreateContainerParameters
    {
        Image = "dpage/pgadmin4",
        Name = "portfolio-pgadmin-aspire",
        Env = new List<string>
        {
            "PGADMIN_DEFAULT_EMAIL=admin@portfolio.local",
            "PGADMIN_DEFAULT_PASSWORD=admin"
        },
        HostConfig = new HostConfig
        {
            PortBindings = new Dictionary<string, IList<PortBinding>>
            {
                ["80/tcp"] = new List<PortBinding> { new() { HostPort = "5050" } }
            },
            AutoRemove = true
        }
    });
    Console.WriteLine($"  ✅ pgAdmin started (ID: {pgAdminContainer[..12]})");

    // Step 4: Conditionally start Kafka & Zookeeper
    string? zookeeperContainer = null;
    string? kafkaContainer = null;
    if (!useMocks)
    {
        Console.WriteLine("\n[4/7] Starting Zookeeper...");
        zookeeperContainer = await StartContainerAsync(dockerClient, new CreateContainerParameters
        {
            Image = "confluentinc/cp-zookeeper:7.5.0",
            Name = "portfolio-zookeeper-aspire",
            Env = new List<string>
            {
                "ZOOKEEPER_CLIENT_PORT=2181",
                "ZOOKEEPER_TICK_TIME=2000"
            },
            HostConfig = new HostConfig
            {
                PortBindings = new Dictionary<string, IList<PortBinding>>
                {
                    ["2181/tcp"] = new List<PortBinding> { new() { HostPort = "2181" } }
                },
                AutoRemove = true
            }
        });
        Console.WriteLine($"  ✅ Zookeeper started (ID: {zookeeperContainer[..12]})");

        Console.WriteLine("\n[5/7] Starting Kafka...");
        await Task.Delay(3000); // Give Zookeeper time to start
        kafkaContainer = await StartContainerAsync(dockerClient, new CreateContainerParameters
        {
            Image = "confluentinc/cp-kafka:7.5.0",
            Name = "portfolio-kafka-aspire",
            Env = new List<string>
            {
                "KAFKA_BROKER_ID=1",
                "KAFKA_ZOOKEEPER_CONNECT=portfolio-zookeeper-aspire:2181",
                "KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092",
                "KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1"
            },
            HostConfig = new HostConfig
            {
                PortBindings = new Dictionary<string, IList<PortBinding>>
                {
                    ["9092/tcp"] = new List<PortBinding> { new() { HostPort = "9092" } }
                },
                AutoRemove = true,
                Links = new List<string> { "portfolio-zookeeper-aspire:zookeeper" }
            }
        });
        Console.WriteLine($"  ✅ Kafka started (ID: {kafkaContainer[..12]})");
    }
    else
    {
        Console.WriteLine("\n[4/7] Skipping Zookeeper (Mock mode)");
        Console.WriteLine("[5/7] Skipping Kafka (Mock mode)");
    }

    // Step 5: Start API
    Console.WriteLine("\n[6/7] Starting Portfolio API...");
    var apiPath = Path.Combine(rootDir, "portfolio.api", "src", "Portfolio.Api", "Portfolio.Api.csproj");
    var apiProcess = new Process
    {
        StartInfo = new ProcessStartInfo
        {
            FileName = "dotnet",
            Arguments = $"run --project \"{apiPath}\" --no-build",
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true
        }
    };

    apiProcess.StartInfo.Environment["ConnectionStrings__DefaultConnection"] = "Host=localhost;Port=5432;Database=portfolio_db;Username=portfolio_user;Password=portfolio_pass";
    apiProcess.StartInfo.Environment["Kafka__Enabled"] = useMocks ? "false" : "true";
    apiProcess.StartInfo.Environment["Kafka__BootstrapServers"] = "localhost:9092";
    apiProcess.StartInfo.Environment["USE_MOCKS"] = useMocks ? "true" : "false";
    apiProcess.StartInfo.Environment["ASPNETCORE_URLS"] = "http://localhost:8085";

    apiProcess.OutputDataReceived += (sender, e) =>
    {
        if (!string.IsNullOrWhiteSpace(e.Data))
            Console.WriteLine($"  [API] {e.Data}");
    };
    apiProcess.ErrorDataReceived += (sender, e) =>
    {
        if (!string.IsNullOrWhiteSpace(e.Data))
            Console.WriteLine($"  [API ERROR] {e.Data}");
    };

    apiProcess.Start();
    apiProcess.BeginOutputReadLine();
    apiProcess.BeginErrorReadLine();
    Console.WriteLine($"  ✅ API started (PID: {apiProcess.Id})");

    // Wait for API to be ready
    await Task.Delay(5000);

    // Step 6: Start Frontend
    Console.WriteLine("\n[7/7] Starting Frontend...");
    var frontendContainer = await StartContainerAsync(dockerClient, new CreateContainerParameters
    {
        Image = "portfolio-frontend:latest",
        Name = "portfolio-frontend-aspire",
        Env = new List<string>
        {
            "API_URL=http://host.docker.internal:8085",
            $"USE_MOCKS={(useMocks ? "true" : "false")}"
        },
        HostConfig = new HostConfig
        {
            PortBindings = new Dictionary<string, IList<PortBinding>>
            {
                ["80/tcp"] = new List<PortBinding> { new() { HostPort = "4200" } }
            },
            ExtraHosts = new List<string> { "host.docker.internal:host-gateway" },
            AutoRemove = true
        }
    });
    Console.WriteLine($"  ✅ Frontend started (ID: {frontendContainer[..12]})");

    // Display access URLs
    Console.WriteLine("\n=======================================================");
    Console.WriteLine("  🚀 All services started successfully!");
    Console.WriteLine("=======================================================");
    Console.WriteLine("  Frontend:    http://localhost:4200");
    Console.WriteLine("  API:         http://localhost:8085");
    Console.WriteLine("  Swagger:     http://localhost:8085/swagger");
    Console.WriteLine("  pgAdmin:     http://localhost:5050");
    Console.WriteLine("  PostgreSQL:  localhost:5432");
    if (!useMocks)
    {
        Console.WriteLine("  Kafka:       localhost:9092");
    }
    Console.WriteLine("-------------------------------------------------------");
    Console.WriteLine("  Press Ctrl+C to stop all services");
    Console.WriteLine("=======================================================\n");

    // Wait for cancellation
    await Task.Delay(Timeout.Infinite, cancellationTokenSource.Token);
}
catch (OperationCanceledException)
{
    Console.WriteLine("\n\n🛑 Shutting down services...");
}
catch (Exception ex)
{
    Console.WriteLine($"\n❌ Error: {ex.Message}");
    Console.WriteLine(ex.StackTrace);
}
finally
{
    // Cleanup
    Console.WriteLine("\nCleaning up containers...");
    var dockerClient = new DockerClientConfiguration().CreateClient();
    
    var containerNames = new[]
    {
        "portfolio-frontend-aspire",
        "portfolio-kafka-aspire",
        "portfolio-zookeeper-aspire",
        "portfolio-pgadmin-aspire",
        "portfolio-postgres-aspire"
    };

    foreach (var name in containerNames)
    {
        try
        {
            await dockerClient.Containers.StopContainerAsync(name, new ContainerStopParameters());
            Console.WriteLine($"  ✅ Stopped {name}");
        }
        catch { }
    }

    Console.WriteLine("\n👋 Goodbye!");
}

static async Task<string> StartContainerAsync(DockerClient client, CreateContainerParameters parameters)
{
    // Remove existing container if exists
    try
    {
        await client.Containers.RemoveContainerAsync(parameters.Name, new ContainerRemoveParameters { Force = true });
    }
    catch { }

    // Create and start container
    var response = await client.Containers.CreateContainerAsync(parameters);
    await client.Containers.StartContainerAsync(response.ID, new ContainerStartParameters());
    return response.ID;
}

