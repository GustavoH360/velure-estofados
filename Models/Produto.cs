using System.ComponentModel.DataAnnotations;

namespace Velure.Models;

public class Produto
{
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Nome { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Categoria { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Cor { get; set; }

    public decimal Preco { get; set; }

    public decimal? PrecoAntigo { get; set; }

    [MaxLength(500)]
    public string? ImagemUrl { get; set; }

    [MaxLength(100)]
    public string? Parcelamento { get; set; }

    public int Desconto { get; set; }

    public int Estoque { get; set; }

    public bool Ativo { get; set; } = true;

public bool Destaque { get; set; } = false;

}
