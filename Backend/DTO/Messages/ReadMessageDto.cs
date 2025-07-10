namespace Chatly.DTO.Messages;

public class ReadMessageDto
{
    public string? ContactId { get; set; }

    public int Skip { get; set; } = 0;

    public int Take { get; set; } = 10;
}