using Masicarus.Domain.Game;
using Masicarus.Domain.Identity;
using Masicarus.Domain.Platform;
using Microsoft.EntityFrameworkCore;

namespace Masicarus.Infrastructure.Persistence;

public sealed class PlatformDbContext(
    DbContextOptions<PlatformDbContext> options) : DbContext(options)
{
    public DbSet<PlatformMetadata> PlatformMetadata => Set<PlatformMetadata>();

    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Character> Characters => Set<Character>();

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

        var character = modelBuilder.Entity<Character>();
        character.ToTable("game_characters");
        character.HasKey(entry => entry.Id);
        character.Property(entry => entry.Id).HasColumnName("id");
        character.Property(entry => entry.AccountId).HasColumnName("account_id");
        character.Property(entry => entry.Name).HasColumnName("name").HasMaxLength(24);
        character.Property(entry => entry.NormalizedName).HasColumnName("normalized_name").HasMaxLength(24);
        character.HasIndex(entry => entry.NormalizedName).IsUnique();
        character.HasIndex(entry => entry.AccountId);
        character.Property(entry => entry.Archetype).HasColumnName("archetype").HasMaxLength(16);
        character.Property(entry => entry.Gender).HasColumnName("gender").HasMaxLength(8);
        character.Property(entry => entry.Customization).HasColumnName("customization").HasColumnType("jsonb");
        character.Property(entry => entry.Level).HasColumnName("level");
        character.Property(entry => entry.CreatedAt).HasColumnName("created_at");
        character.Property(entry => entry.DeletionScheduledAt).HasColumnName("deletion_scheduled_at");
        character.HasOne<Account>().WithMany().HasForeignKey(entry => entry.AccountId).OnDelete(DeleteBehavior.Cascade);
    }
}
