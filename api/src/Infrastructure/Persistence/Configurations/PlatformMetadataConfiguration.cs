using Masicarus.Domain.Platform;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Masicarus.Infrastructure.Persistence.Configurations;

public sealed class PlatformMetadataConfiguration
    : IEntityTypeConfiguration<PlatformMetadata>
{
    public void Configure(EntityTypeBuilder<PlatformMetadata> builder)
    {
        builder.ToTable("platform_metadata");
        builder.HasKey(entry => entry.Key);
        builder.Property(entry => entry.Key)
            .HasColumnName("key").HasMaxLength(100);
        builder.Property(entry => entry.Value)
            .HasColumnName("value").HasMaxLength(500);
        builder.Property(entry => entry.UpdatedAt).HasColumnName("updated_at");
    }
}
