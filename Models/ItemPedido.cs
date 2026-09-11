using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Velure.Models;

public class ItemPedido
{
    public int Id { get; set; }

    public int PedidoId { get; set; }

    public Pedido Pedido { get; set; } = null!;

    public int ProdutoId { get; set; }

    [Required]
    [MaxLength(150)]
    public string NomeProduto { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal PrecoUnitario { get; set; }

    public int Quantidade { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Subtotal { get; set; }
}