using Chatly.DTO.Accounts;

namespace Chatly.DTO.Contacts;

public class GetContactUserRequestDto
{
    public string? ContactId { get; set; }
}

public class ContactUserDto
{
    public string? ContactId { get; set; }
    public UserDto? ContactUser { get; set; }

}