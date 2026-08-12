using MirajOfIcarus.Domain.Accounts;

namespace MirajOfIcarus.Application.Accounts;

public interface IAccountRepository
{
    Task<Account?> FindByNormalizedUserNameAsync(
        string normalizedUserName,
        CancellationToken cancellationToken = default);

    Task<bool> CreateAsync(
        Account account,
        CancellationToken cancellationToken = default);
}
