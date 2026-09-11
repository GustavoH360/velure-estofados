using System.ComponentModel.DataAnnotations;

namespace Velure.Models;

public class Cliente
{
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Nome { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string SenhaHash { get; set; } = string.Empty;

    public DateTime CriadoEm { get; set; } = DateTime.Now;

    public bool Ativo { get; set; } = true;

    // Permissão administrativa
    public bool IsAdmin { get; set; } = false;
}