using Masicarus.Domain.Accounts;
using Masicarus.Domain.Characters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Masicarus.Infrastructure.Persistence.Configurations;

public sealed class CharacterConfiguration : IEntityTypeConfiguration<Character>
{
    public void Configure(EntityTypeBuilder<Character> builder)
    {
        builder.ToTable("game_characters");
        builder.HasKey(entry => entry.Id);
        builder.Property(entry => entry.Id).HasColumnName("id");
        builder.Property(entry => entry.AccountId).HasColumnName("account_id");
        builder.Property(entry => entry.Name).HasColumnName("name").HasMaxLength(24);
        builder.Property(entry => entry.NormalizedName)
            .HasColumnName("normalized_name").HasMaxLength(24);
        builder.HasIndex(entry => entry.NormalizedName).IsUnique();
        builder.HasIndex(entry => entry.AccountId);
        builder.Property(entry => entry.Archetype)
            .HasColumnName("archetype").HasMaxLength(16);
        builder.Property(entry => entry.Gender).HasColumnName("gender").HasMaxLength(8);
        builder.Property(entry => entry.Customization)
            .HasColumnName("customization").HasColumnType("jsonb");
        builder.Property(entry => entry.Level).HasColumnName("level");
        builder.Property(entry => entry.CreatedAt).HasColumnName("created_at");
        builder.Property(entry => entry.DeletionScheduledAt)
            .HasColumnName("deletion_scheduled_at");
        builder.HasOne<Account>().WithMany()
            .HasForeignKey(entry => entry.AccountId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
