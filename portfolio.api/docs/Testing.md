# Testing Guide

This project uses xUnit, Moq, and FluentAssertions for unit testing.

## Running Tests

```bash
# Run all tests
dotnet test

# Run with detailed output
dotnet test --verbosity detailed

# Run with coverage
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
```

## Test Structure

Tests should follow the Arrange-Act-Assert (AAA) pattern:

```csharp
[Fact]
public async Task Handle_ValidInput_ReturnsExpectedResult()
{
    // Arrange - Set up test data and mocks
    var mockRepository = new Mock<IRepository>();
    mockRepository.Setup(x => x.GetAsync(It.IsAny<Guid>()))
        .ReturnsAsync(new Entity());
    
    var handler = new Handler(mockRepository.Object);
    
    // Act - Execute the method under test
    var result = await handler.HandleAsync(command);
    
    // Assert - Verify the results
    result.Should().NotBeNull();
    mockRepository.Verify(x => x.GetAsync(It.IsAny<Guid>()), Times.Once);
}
```

## Example: Testing a Handler

### 1. Handler Class (Application Layer)

```csharp
public class CreateTenantCommandHandler : IHandler<CreateTenantCommand, TenantDto>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IMessageBus _messageBus;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTenantCommandHandler(
        ITenantRepository tenantRepository,
        IMessageBus messageBus,
        IUnitOfWork unitOfWork)
    {
        _tenantRepository = tenantRepository;
        _messageBus = messageBus;
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantDto> HandleAsync(
        CreateTenantCommand command,
        CancellationToken cancellationToken = default)
    {
        // Implementation...
    }
}
```

### 2. Test Class

```csharp
using Xunit;
using Moq;
using FluentAssertions;
using Portfolio.Application.Handlers;
using Portfolio.Application.Commands;
using Portfolio.Application.DTOs;
using Portfolio.Application.Interfaces;
using Portfolio.Domain.Entities;

namespace Portfolio.Application.Tests.Handlers;

public class CreateTenantHandlerTests
{
    private readonly Mock<ITenantRepository> _repositoryMock;
    private readonly Mock<IMessageBus> _messageBusMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly CreateTenantCommandHandler _handler;

    public CreateTenantHandlerTests()
    {
        // Set up mocks
        _repositoryMock = new Mock<ITenantRepository>();
        _messageBusMock = new Mock<IMessageBus>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        // Create handler with mocked dependencies
        _handler = new CreateTenantCommandHandler(
            _repositoryMock.Object,
            _messageBusMock.Object,
            _unitOfWorkMock.Object
        );
    }

    [Fact]
    public async Task CreateTenant_ValidData_ReturnsDto()
    {
        // Arrange
        var dto = new CreateTenantDto
        {
            Name = "Test Company",
            Subdomain = "testcompany"
        };
        var command = new CreateTenantCommand(dto);

        _repositoryMock
            .Setup(x => x.GetBySubdomainAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tenant?)null); // No existing tenant

        _repositoryMock
            .Setup(x => x.AddAsync(It.IsAny<Tenant>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tenant t, CancellationToken ct) => t);

        _unitOfWorkMock
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(dto.Name);
        result.Subdomain.Should().Be(dto.Subdomain.ToLowerInvariant());
        result.IsActive.Should().BeTrue();

        // Verify interactions
        _repositoryMock.Verify(
            x => x.AddAsync(It.Is<Tenant>(t => 
                t.Name == dto.Name && 
                t.Subdomain == dto.Subdomain.ToLowerInvariant()
            ), It.IsAny<CancellationToken>()),
            Times.Once
        );

        _unitOfWorkMock.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once
        );

        _messageBusMock.Verify(
            x => x.PublishAsync(It.IsAny<TenantCreatedEvent>(), It.IsAny<CancellationToken>()),
            Times.Once
        );
    }

    [Fact]
    public async Task CreateTenant_DuplicateSubdomain_ThrowsException()
    {
        // Arrange
        var dto = new CreateTenantDto
        {
            Name = "Test Company",
            Subdomain = "existing"
        };
        var command = new CreateTenantCommand(dto);

        var existingTenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "Existing Company",
            Subdomain = "existing",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _repositoryMock
            .Setup(x => x.GetBySubdomainAsync(dto.Subdomain, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingTenant);

        // Act
        Func<Task> act = async () => await _handler.HandleAsync(command);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*subdomain*already exists*");
    }
}
```

## Moq Cheat Sheet

### Setup Methods

```csharp
// Return a value
mock.Setup(x => x.Method()).Returns(value);

// Return async value
mock.Setup(x => x.MethodAsync()).ReturnsAsync(value);

// Return based on parameters
mock.Setup(x => x.Method(It.IsAny<string>())).Returns((string s) => s.ToUpper());

// Throw exception
mock.Setup(x => x.Method()).Throws<InvalidOperationException>();
```

### Verification

```csharp
// Verify method was called once
mock.Verify(x => x.Method(), Times.Once);

// Verify never called
mock.Verify(x => x.Method(), Times.Never);

// Verify with specific parameters
mock.Verify(x => x.Method(42), Times.Exactly(2));

// Verify with conditions
mock.Verify(x => x.Method(It.Is<int>(i => i > 0)), Times.AtLeastOnce);
```

## FluentAssertions Cheat Sheet

### Basic Assertions

```csharp
// Equality
result.Should().Be(expected);
result.Should().NotBe(unexpected);

// Null checks
result.Should().BeNull();
result.Should().NotBeNull();

// Boolean
flag.Should().BeTrue();
flag.Should().BeFalse();

// Strings
text.Should().StartWith("Hello");
text.Should().EndWith("World");
text.Should().Contain("test");
text.Should().Match("*pattern*");

// Numbers
number.Should().BeGreaterThan(5);
number.Should().BeLessThanOrEqualTo(10);
number.Should().BeInRange(1, 100);

// Collections
list.Should().HaveCount(3);
list.Should().Contain(item);
list.Should().BeEmpty();
list.Should().BeEquivalentTo(expectedList);

// Exceptions
Action act = () => SomeMethod();
act.Should().Throw<ArgumentException>()
    .WithMessage("*parameter*");

// Async exceptions
Func<Task> act = async () => await SomeMethodAsync();
await act.Should().ThrowAsync<InvalidOperationException>();

// DateTime
date.Should().BeCloseTo(DateTime.Now, TimeSpan.FromSeconds(1));
date.Should().BeAfter(otherDate);
date.Should().BeBefore(otherDate);
```

## Test Patterns

### 1. Testing with Multiple Scenarios (Theory)

```csharp
[Theory]
[InlineData("admin")]
[InlineData("editor")]
[InlineData("viewer")]
public async Task ValidateRole_ValidRoles_ReturnsTrue(string role)
{
    // Arrange
    var validator = new RoleValidator();

    // Act
    var result = await validator.IsValidAsync(role);

    // Assert
    result.Should().BeTrue();
}
```

### 2. Testing Async Methods

```csharp
[Fact]
public async Task GetById_ExistingId_ReturnsEntity()
{
    // Arrange
    var id = Guid.NewGuid();
    var expected = new Entity { Id = id, Name = "Test" };
    
    _repositoryMock
        .Setup(x => x.GetByIdAsync(id))
        .ReturnsAsync(expected);

    // Act
    var result = await _service.GetByIdAsync(id);

    // Assert
    result.Should().BeEquivalentTo(expected);
}
```

### 3. Testing Event Publishing

```csharp
[Fact]
public async Task CreateBlog_Success_PublishesEvent()
{
    // Arrange
    // ... setup code ...

    DomainEvent? publishedEvent = null;
    _messageBusMock
        .Setup(x => x.PublishAsync(It.IsAny<BlogCreatedEvent>(), It.IsAny<CancellationToken>()))
        .Callback<DomainEvent, CancellationToken>((evt, ct) => publishedEvent = evt)
        .Returns(Task.CompletedTask);

    // Act
    await _handler.HandleAsync(command);

    // Assert
    publishedEvent.Should().NotBeNull();
    publishedEvent.Should().BeOfType<BlogCreatedEvent>();
    
    var blogEvent = (BlogCreatedEvent)publishedEvent;
    blogEvent.Title.Should().Be("Test Blog");
}
```

## Integration Testing

For integration tests, consider using:
- **Test containers**: Spin up PostgreSQL in Docker
- **In-memory database**: Use EF Core in-memory provider
- **WebApplicationFactory**: Test ASP.NET Core endpoints

### Example Integration Test Setup

```csharp
public class IntegrationTestBase : IAsyncLifetime
{
    protected PortfolioDbContext DbContext { get; private set; }
    
    public async Task InitializeAsync()
    {
        var options = new DbContextOptionsBuilder<PortfolioDbContext>()
            .UseInMemoryDatabase($"TestDb_{Guid.NewGuid()}")
            .Options;
            
        DbContext = new PortfolioDbContext(options);
        await DbContext.Database.EnsureCreatedAsync();
    }

    public async Task DisposeAsync()
    {
        await DbContext.DisposeAsync();
    }
}
```

## Coverage Goals

- **Unit Tests**: Aim for 80%+ coverage on business logic
- **Integration Tests**: Cover main user flows
- **E2E Tests**: Critical paths only

## CI/CD Integration

Tests run automatically in Azure DevOps pipeline (see `azure-pipelines.yml`):

```yaml
- task: DotNetCoreCLI@2
  displayName: 'Run Tests'
  inputs:
    command: 'test'
    projects: '**/*Tests.csproj'
    arguments: '--configuration Release --collect:"XPlat Code Coverage"'
```

## Best Practices

1. **Test one thing per test**: Each test should verify a single behavior
2. **Use descriptive names**: `MethodName_Scenario_ExpectedResult`
3. **Keep tests fast**: Avoid slow operations like file I/O
4. **Avoid test interdependence**: Tests should run in any order
5. **Mock external dependencies**: Don't call real APIs or databases in unit tests
6. **Use realistic test data**: Reflects actual usage patterns
7. **Clean up resources**: Implement IDisposable/IAsyncLifetime when needed

## Next Steps

To implement comprehensive tests:

1. Create test files in `tests/Portfolio.Application.Tests/Handlers/`
2. Test each command handler for:
   - Success scenarios
   - Validation failures
   - Duplicate entity checks
   - Exception handling
3. Add integration tests for:
   - Database operations
   - API endpoints
   - End-to-end workflows
