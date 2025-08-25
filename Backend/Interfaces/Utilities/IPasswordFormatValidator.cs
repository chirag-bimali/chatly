namespace Chatly.Interfaces.Utilities;

public interface IPasswordFormatValidator
{
    bool IsValid(string? password, out List<string> errors);
}