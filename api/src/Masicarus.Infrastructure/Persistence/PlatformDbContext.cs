using Masicarus.Domain.Identity;
using Masicarus.Domain.Platform;
using Microsoft.EntityFrameworkCore;

namespace Masicarus.Infrastructure.Persistence;

public sealed class PlatformDbContext(
    DbContextOptions<PlatformDbContext> options) : DbContext(options)
{
    public DbSet<PlatformMetadata> PlatformMetadata => Set<PlatformMetadata>();

    public DbSet<Account> Accounts => Set<Account>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var metadata = modelBuilder.Entity<PlatformMetadata>();

        metadata.ToTable("platform_metadata");
        metadata.HasKey(entry => entry.Key);
        metadata.Property(entry => entry.Key).HasColumnName("key").HasMaxLength(100);
        metadata.Property(entry => entry.Value).HasColumnName("value").HasMaxLength(500);
        metadata.Property(entry => entry.UpdatedAt).HasColumnName("updated_at");

        var account = modelBuilder.Entity<Account>();
        account.ToTable("accounts");
        account.HasKey(entry => entry.Id);
        account.Property(entry => entry.Id).HasColumnName("id").UseIdentityByDefaultColumn();
        account.Property(entry => entry.UserName).HasColumnName("user_name").HasMaxLength(32);
        account.Property(entry => entry.NormalizedUserName)
            .HasColumnName("normalized_user_name")
            .HasMaxLength(32);
        account.HasIndex(entry => entry.NormalizedUserName).IsUnique();
        account.Property(entry => entry.PasswordHash).HasColumnName("password_hash").HasMaxLength(100);
        account.Property(entry => entry.PasswordSalt).HasColumnName("password_salt").HasMaxLength(100);
        account.Property(entry => entry.CreatedAt).HasColumnName("created_at");
    }
}
