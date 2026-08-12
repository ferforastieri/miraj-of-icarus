using MirajOfIcarus.Application;
using MirajOfIcarus.Domain;
using MirajOfIcarus.Infrastructure;
using Microsoft.AspNetCore.Mvc;

namespace MirajOfIcarus.Api.Tests.Architecture;

public sealed class LayerDependencyTests
{
    [Fact]
    public void DomainDoesNotDependOnOuterLayers()
    {
        var references = ReferencedAssemblies(typeof(DomainAssembly).Assembly);

        Assert.DoesNotContain("MirajOfIcarus.Application", references);
        Assert.DoesNotContain("MirajOfIcarus.Infrastructure", references);
        Assert.DoesNotContain("MirajOfIcarus.Api", references);
    }

    [Fact]
    public void ApplicationDoesNotDependOnInfrastructureOrApi()
    {
        var references = ReferencedAssemblies(typeof(ApplicationAssembly).Assembly);

        Assert.DoesNotContain("MirajOfIcarus.Infrastructure", references);
        Assert.DoesNotContain("MirajOfIcarus.Api", references);
    }

    [Fact]
    public void InfrastructureDoesNotDependOnApi()
    {
        var references = ReferencedAssemblies(typeof(InfrastructureAssembly).Assembly);

        Assert.DoesNotContain("MirajOfIcarus.Api", references);
    }

    [Fact]
    public void ControllersReceiveApplicationServicesInsteadOfInfrastructure()
    {
        var controllers = typeof(Program).Assembly.GetTypes()
            .Where(type => !type.IsAbstract && typeof(ControllerBase).IsAssignableFrom(type));

        foreach (var controller in controllers)
        {
            var parameters = controller.GetConstructors()
                .SelectMany(constructor => constructor.GetParameters());
            Assert.DoesNotContain(parameters, parameter =>
                parameter.ParameterType.Assembly == typeof(InfrastructureAssembly).Assembly);
        }
    }

    private static HashSet<string?> ReferencedAssemblies(System.Reflection.Assembly assembly) =>
        assembly.GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToHashSet(StringComparer.Ordinal);
}
