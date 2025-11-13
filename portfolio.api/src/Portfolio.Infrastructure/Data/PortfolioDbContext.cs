using Microsoft.EntityFrameworkCore;
using Portfolio.Domain.Entities;
using System.Text.Json;

namespace Portfolio.Infrastructure.Data;

public class PortfolioDbContext : DbContext
{
    public PortfolioDbContext(DbContextOptions<PortfolioDbContext> options)
        : base(options)
    {
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Blog> Blogs => Set<Blog>();
    public DbSet<PortfolioEntity> Portfolios => Set<PortfolioEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Tenant configuration
        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.ToTable("Tenants");
            entity.HasKey(t => t.Id);
            entity.HasIndex(t => t.Subdomain).IsUnique();
            entity.Property(t => t.Name).IsRequired().HasMaxLength(200);
            entity.Property(t => t.Subdomain).IsRequired().HasMaxLength(100);
            
            entity.HasMany(t => t.Users)
                .WithOne(u => u.Tenant)
                .HasForeignKey(u => u.TenantId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasMany(t => t.Blogs)
                .WithOne(b => b.Tenant)
                .HasForeignKey(b => b.TenantId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasMany(t => t.Portfolios)
                .WithOne(p => p.Tenant)
                .HasForeignKey(p => p.TenantId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => new { u.Email, u.TenantId }).IsUnique();
            entity.Property(u => u.Email).IsRequired().HasMaxLength(255);
            entity.Property(u => u.FirstName).HasMaxLength(100);
            entity.Property(u => u.LastName).HasMaxLength(100);
            entity.Property(u => u.Role).HasConversion<string>();
            entity.Property(u => u.AuthProvider).HasConversion<string>();
        });

        // Blog configuration
        modelBuilder.Entity<Blog>(entity =>
        {
            entity.ToTable("Blogs");
            entity.HasKey(b => b.Id);
            entity.HasIndex(b => new { b.Slug, b.TenantId }).IsUnique();
            entity.Property(b => b.Title).IsRequired().HasMaxLength(500);
            entity.Property(b => b.Slug).IsRequired().HasMaxLength(500);
            entity.Property(b => b.Content).IsRequired();
            entity.Property(b => b.Tags)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>()
                );

            entity.HasOne(b => b.Author)
                .WithMany()
                .HasForeignKey(b => b.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Portfolio configuration
        modelBuilder.Entity<PortfolioEntity>(entity =>
        {
            entity.ToTable("Portfolios");
            entity.HasKey(p => p.Id);
            entity.HasIndex(p => new { p.UserId, p.TenantId }).IsUnique();
            entity.Property(p => p.Title).IsRequired().HasMaxLength(200);
            entity.Property(p => p.Template).HasConversion<string>();
            entity.OwnsOne(p => p.Data, data =>
            {
                data.Property(d => d.WorkExperiences)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<List<WorkExperience>>(v, (JsonSerializerOptions?)null) ?? new List<WorkExperience>()
                    )
                    .HasColumnName("WorkExperiences");

                data.Property(d => d.Educations)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<List<Education>>(v, (JsonSerializerOptions?)null) ?? new List<Education>()
                    )
                    .HasColumnName("Educations");

                data.Property(d => d.Skills)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<List<Skill>>(v, (JsonSerializerOptions?)null) ?? new List<Skill>()
                    )
                    .HasColumnName("Skills");

                data.Property(d => d.Projects)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<List<Project>>(v, (JsonSerializerOptions?)null) ?? new List<Project>()
                    )
                    .HasColumnName("Projects");

                data.Property(d => d.Certifications)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<List<Certification>>(v, (JsonSerializerOptions?)null) ?? new List<Certification>()
                    )
                    .HasColumnName("Certifications");
            });

            entity.HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
