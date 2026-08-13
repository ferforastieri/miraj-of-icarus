using MirajOfIcarus.Domain.Administration;
using MirajOfIcarus.Domain.Accounts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MirajOfIcarus.Infrastructure.Persistence.Configurations;

public sealed class AdministrationAuditConfiguration : IEntityTypeConfiguration<AdministrationAudit>
{
    public void Configure(EntityTypeBuilder<AdministrationAudit> builder)
    {
        builder.ToTable("administration_audit");
        builder.HasKey(value => value.Id);
        builder.Property(value => value.Id).HasColumnName("id").UseIdentityByDefaultColumn();
        builder.Property(value => value.AdministratorAccountId).HasColumnName("administrator_account_id");
        builder.Property(value => value.Action).HasColumnName("action").HasMaxLength(80);
        builder.Property(value => value.Target).HasColumnName("target").HasMaxLength(160);
        builder.Property(value => value.Details).HasColumnName("details").HasColumnType("jsonb");
        builder.Property(value => value.CreatedAt).HasColumnName("created_at");
        builder.HasIndex(value => value.CreatedAt);
        builder.HasOne<Account>().WithMany().HasForeignKey(value => value.AdministratorAccountId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class GameServerOverrideConfiguration : IEntityTypeConfiguration<GameServerOverride>
{
    public void Configure(EntityTypeBuilder<GameServerOverride> builder)
    {
        builder.ToTable("game_server_overrides");
        builder.HasKey(value => value.ServerId);
        builder.Property(value => value.ServerId).HasColumnName("server_id").HasMaxLength(80);
        builder.Property(value => value.Maintenance).HasColumnName("maintenance");
        builder.Property(value => value.Message).HasColumnName("message").HasMaxLength(240);
        builder.Property(value => value.UpdatedAt).HasColumnName("updated_at");
        builder.Property(value => value.UpdatedByAccountId).HasColumnName("updated_by_account_id");
        builder.HasOne<Account>().WithMany().HasForeignKey(value => value.UpdatedByAccountId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
