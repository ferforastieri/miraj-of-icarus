using MirajOfIcarus.Domain.Accounts;

namespace MirajOfIcarus.Application.Accounts;

public interface IAccountRepository
{
    Task<Account?> FindByNormalizedUserNameAsync(
        string normalizedUserName,
        CancellationToken cancellationToken = default);

    Task<Account?> FindByIdAsync(
        long accountId,
        CancellationToken cancellationToken = default);

    Task<long> CountAsync(CancellationToken cancellationToken = default);

    Task<long> CountMatchingAsync(
        string? query,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Account>> SearchAsync(
        string? query,
        int skip,
        int take,
        CancellationToken cancellationToken = default);

    Task<bool> CreateAsync(
        Account account,
        CancellationToken cancellationToken = default);

    Task SaveAsync(Account account, CancellationToken cancellationToken = default);
}
