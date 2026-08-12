using Masicarus.Domain.Accounts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Masicarus.Infrastructure.Persistence.Configurations;

public sealed class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.ToTable("accounts");
        builder.HasKey(entry => entry.Id);
        builder.Property(entry => entry.Id).HasColumnName("id").UseIdentityByDefaultColumn();
        builder.Property(entry => entry.UserName).HasColumnName("user_name").HasMaxLength(32);
        builder.Property(entry => entry.NormalizedUserName)
            .HasColumnName("normalized_user_name")
            .HasMaxLength(32);
        builder.HasIndex(entry => entry.NormalizedUserName).IsUnique();
        builder.Property(entry => entry.PasswordHash)
            .HasColumnName("password_hash").HasMaxLength(100);
        builder.Property(entry => entry.PasswordSalt)
            .HasColumnName("password_salt").HasMaxLength(100);
        builder.Property(entry => entry.CreatedAt).HasColumnName("created_at");
    }
}
