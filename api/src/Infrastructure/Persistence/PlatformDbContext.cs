using MirajOfIcarus.Domain.Accounts;
using MirajOfIcarus.Domain.Characters;
using MirajOfIcarus.Domain.Platform;
using Microsoft.EntityFrameworkCore;

namespace MirajOfIcarus.Infrastructure.Persistence;

public sealed class PlatformDbContext(
    DbContextOptions<PlatformDbContext> options) : DbContext(options)
{
    public DbSet<PlatformMetadata> PlatformMetadata => Set<PlatformMetadata>();

    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Character> Characters => Set<Character>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PlatformDbContext).Assembly);
}
