using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Velure.Models;

public class Pedido
{
    public int Id { get; set; }

    public int ClienteId { get; set; }

    public Cliente Cliente { get; set; } = null!;

    public DateTime CriadoEm { get; set; } = DateTime.Now;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Total { get; set; }

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "Pendente";

    public List<ItemPedido> Itens { get; set; } = new();


[MaxLength(20)]
public string? Telefone { get; set; }

[MaxLength(14)]
public string? Cpf { get; set; }

[MaxLength(10)]
public string? Cep { get; set; }

[MaxLength(200)]
public string? Endereco { get; set; }

[MaxLength(20)]
public string? Numero { get; set; }

[MaxLength(100)]
public string? Complemento { get; set; }

[MaxLength(100)]
public string? Bairro { get; set; }

[MaxLength(100)]
public string? Cidade { get; set; }

[MaxLength(2)]
public string? Estado { get; set; }

[MaxLength(50)]
public string? FormaPagamento { get; set; }


}