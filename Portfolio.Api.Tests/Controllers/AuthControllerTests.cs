using Xunit;
using Moq;
using FluentAssertions;
using Portfolio.Application.Handlers;
using Portfolio.Application.Queries;
using Portfolio.Application.Commands;
using Portfolio.Application.DTOs;
using Portfolio.Domain.Entities;
using Portfolio.Application.Interfaces;
using System.Threading.Tasks;

namespace Portfolio.Api.Tests.Handlers;

public class TenantHandlerTests
{
    private readonly Mock<ITenantRepository> _tenantRepositoryMock;

    public TenantHandlerTests()
    {
        _tenantRepositoryMock = new Mock<ITenantRepository>();
    }

    [Fact]
    public async Task GetAllTenantsQueryHandler_ReturnsAllTenants()
    {
        // Arrange
        var tenants = new List<Tenant>
        {
            new() { Id = Guid.NewGuid(), Name = "Tenant 1", Subdomain = "tenant1", IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), Name = "Tenant 2", Subdomain = "tenant2", IsActive = true, CreatedAt = DateTime.UtcNow }
        };

        _tenantRepositoryMock
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenants);

        var handler = new GetAllTenantsQueryHandler(_tenantRepositoryMock.Object);
        var query = new GetAllTenantsQuery();

        // Act
        var result = (await handler.HandleAsync(query)).ToList();

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(t => t.Name == "Tenant 1");
        result.Should().Contain(t => t.Name == "Tenant 2");
        _tenantRepositoryMock.Verify(r => r.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetTenantByIdQueryHandler_WithValidId_ReturnsTenant()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "Test Tenant",
            Subdomain = "testtenant",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _tenantRepositoryMock
            .Setup(r => r.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);

        var handler = new GetTenantByIdQueryHandler(_tenantRepositoryMock.Object);
        var query = new GetTenantByIdQuery(tenantId);

        // Act
        var result = await handler.HandleAsync(query);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(tenantId);
        result.Name.Should().Be("Test Tenant");
        _tenantRepositoryMock.Verify(r => r.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetTenantBySubdomainQueryHandler_WithValidSubdomain_ReturnsTenant()
    {
        // Arrange
        var subdomain = "mytenant";
        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "My Tenant",
            Subdomain = subdomain,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _tenantRepositoryMock
            .Setup(r => r.GetBySubdomainAsync(subdomain, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);

        var handler = new GetTenantBySubdomainQueryHandler(_tenantRepositoryMock.Object);
        var query = new GetTenantBySubdomainQuery(subdomain);

        // Act
        var result = await handler.HandleAsync(query);

        // Assert
        result.Should().NotBeNull();
        result!.Subdomain.Should().Be(subdomain);
        result.Name.Should().Be("My Tenant");
        _tenantRepositoryMock.Verify(r => r.GetBySubdomainAsync(subdomain, It.IsAny<CancellationToken>()), Times.Once);
    }
}



