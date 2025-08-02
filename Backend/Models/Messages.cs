using System.ComponentModel.DataAnnotations.Schema;

namespace Chatly.Models;

public class Message
{
    public string? Id { get; set; }

    public string? ContactId { get; set; }
    public string? SenderId { get; set; }

    public string? Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? SeenAt { get; set; }
    public bool Read { get; set; }
    public bool IsForwarded { get; set; }
    public bool IsReply { get; set; }

    public User? Sender { get; set; }
    
    [ForeignKey(nameof(ContactId))]
    public Contact? Contact { get; set; }
    public ReplyMessage? ReplyMessage { get; set; }
    public ForwardMessage? ForwardMessage { get; set; }
}