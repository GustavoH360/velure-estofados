using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Velure.Data;
using Velure.Models;

namespace Velure.Controllers;

[ApiController]
[Route("api/pedidos")]
[Authorize]
public class PedidosController : ControllerBase
{
    private readonly AppDbContext _context;

    public PedidosController(AppDbContext context)
    {
        _context = context;
    }

    // =========================================================
    // FINALIZAR PEDIDO
    // POST: /api/pedidos/finalizar
    // =========================================================
    [HttpPost("finalizar")]
    public async Task<IActionResult> Finalizar(
        [FromBody] FinalizarPedidoRequest request)
    {
        var clienteIdTexto =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(clienteIdTexto, out var clienteId))
        {
            return Unauthorized(new
            {
                mensagem = "Usuário não autenticado."
            });
        }

        if (request.Itens == null || request.Itens.Count == 0)
        {
            return BadRequest(new
            {
                mensagem = "O carrinho está vazio."
            });
        }

        // Validação dos dados do checkout
        if (string.IsNullOrWhiteSpace(request.Telefone) ||
            string.IsNullOrWhiteSpace(request.Cep) ||
            string.IsNullOrWhiteSpace(request.Endereco) ||
            string.IsNullOrWhiteSpace(request.Numero) ||
            string.IsNullOrWhiteSpace(request.Bairro) ||
            string.IsNullOrWhiteSpace(request.Cidade) ||
            string.IsNullOrWhiteSpace(request.Estado) ||
            string.IsNullOrWhiteSpace(request.FormaPagamento))
        {
            return BadRequest(new
            {
                mensagem = "Preencha todos os campos obrigatórios."
            });
        }


// =========================================================
// VALIDAÇÃO DOS DADOS DO CHECKOUT
// =========================================================

// TELEFONE
var telefoneNumeros =
    new string(
        (request.Telefone ?? "")
        .Where(char.IsDigit)
        .ToArray()
    );

if (telefoneNumeros.Length != 10 &&
    telefoneNumeros.Length != 11)
{
    return BadRequest(new
    {
        mensagem = "Informe um telefone válido com DDD."
    });
}


// CPF - continua opcional
var cpfNumeros =
    new string(
        (request.Cpf ?? "")
        .Where(char.IsDigit)
        .ToArray()
    );

if (!string.IsNullOrWhiteSpace(request.Cpf) &&
    cpfNumeros.Length != 11)
{
    return BadRequest(new
    {
        mensagem = "Informe um CPF completo."
    });
}


// CEP
var cepNumeros =
    new string(
        (request.Cep ?? "")
        .Where(char.IsDigit)
        .ToArray()
    );

if (cepNumeros.Length != 8)
{
    return BadRequest(new
    {
        mensagem = "Informe um CEP válido com 8 números."
    });
}


// ESTADO
var estado =
    (request.Estado ?? "")
    .Trim()
    .ToUpperInvariant();

if (estado.Length != 2 ||
    !estado.All(char.IsLetter))
{
    return BadRequest(new
    {
        mensagem =
            "Informe a sigla do estado com 2 letras. Exemplo: SP."
    });
}

        var idsProdutos =
            request.Itens
                .Select(i => i.ProdutoId)
                .Distinct()
                .ToList();

        var produtos =
            await _context.Produtos
                .Where(p =>
                    idsProdutos.Contains(p.Id) &&
                    p.Ativo)
                .ToListAsync();

        if (produtos.Count != idsProdutos.Count)
        {
            return BadRequest(new
            {
                mensagem =
                    "Um ou mais produtos não estão disponíveis."
            });
        }

        decimal total = 0;

        var itensPedido = new List<ItemPedido>();

        foreach (var itemCarrinho in request.Itens)
        {
            if (itemCarrinho.Quantidade <= 0)
            {
                return BadRequest(new
                {
                    mensagem =
                        "Quantidade de produto inválida."
                });
            }

            var produto =
                produtos.FirstOrDefault(
                    p => p.Id == itemCarrinho.ProdutoId
                );

            if (produto == null)
            {
                return BadRequest(new
                {
                    mensagem =
                        "Produto não encontrado."
                });
            }

            if (produto.Estoque < itemCarrinho.Quantidade)
            {
                return BadRequest(new
                {
                    mensagem =
                        $"Estoque insuficiente para {produto.Nome}."
                });
            }

            var subtotal =
                produto.Preco * itemCarrinho.Quantidade;

            total += subtotal;

            itensPedido.Add(
                new ItemPedido
                {
                    ProdutoId = produto.Id,
                    NomeProduto = produto.Nome,
                    PrecoUnitario = produto.Preco,
                    Quantidade = itemCarrinho.Quantidade,
                    Subtotal = subtotal
                }
            );
        }

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            var pedido = new Pedido
            {
                ClienteId = clienteId,

                CriadoEm = DateTime.Now,

                Total = total,

                Status = "Pendente",

                Telefone = request.Telefone?.Trim(),

                Cpf = request.Cpf?.Trim(),

                Cep = request.Cep?.Trim(),

                Endereco = request.Endereco?.Trim(),

                Numero = request.Numero?.Trim(),

                Complemento = request.Complemento?.Trim(),

                Bairro = request.Bairro?.Trim(),

                Cidade = request.Cidade?.Trim(),

                Estado = request.Estado?
                    .Trim()
                    .ToUpper(),

                FormaPagamento =
                    request.FormaPagamento?.Trim(),

                Itens = itensPedido
            };

            foreach (var itemCarrinho in request.Itens)
            {
                var produto =
                    produtos.First(
                        p => p.Id == itemCarrinho.ProdutoId
                    );

                produto.Estoque -=
                    itemCarrinho.Quantidade;
            }

            _context.Pedidos.Add(pedido);

            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new
            {
                mensagem =
                    "Pedido realizado com sucesso.",

                pedido = new
                {
                    id = pedido.Id,
                    total = pedido.Total,
                    status = pedido.Status,
                    criadoEm = pedido.CriadoEm
                }
            });
        }
        catch
        {
            await transaction.RollbackAsync();

            return StatusCode(
                500,
                new
                {
                    mensagem =
                        "Não foi possível finalizar o pedido."
                }
            );
        }
    }

    // =========================================================
    // MEUS PEDIDOS
    // GET: /api/pedidos/meus
    // =========================================================
    [HttpGet("meus")]
    public async Task<IActionResult> MeusPedidos()
    {
        var clienteIdTexto =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(clienteIdTexto, out var clienteId))
        {
            return Unauthorized();
        }

        var pedidos =
            await _context.Pedidos

                .Where(p =>
                    p.ClienteId == clienteId)

                .Include(p => p.Itens)

                .OrderByDescending(p =>
                    p.CriadoEm)

                .Select(p => new
                {
                    id = p.Id,

                    criadoEm = p.CriadoEm,

                    total = p.Total,

                    status = p.Status,

                    telefone = p.Telefone,

                    cep = p.Cep,

                    endereco = p.Endereco,

                    numero = p.Numero,

                    bairro = p.Bairro,

                    cidade = p.Cidade,

                    estado = p.Estado,

                    formaPagamento =
                        p.FormaPagamento,

                    itens =
                        p.Itens.Select(i => new
                        {
                            produtoId =
                                i.ProdutoId,

                            nomeProduto =
                                i.NomeProduto,

                            precoUnitario =
                                i.PrecoUnitario,

                            quantidade =
                                i.Quantidade,

                            subtotal =
                                i.Subtotal
                        })
                        .ToList()
                })

                .ToListAsync();

        return Ok(pedidos);
    }
}


// =============================================================
// DTO - FINALIZAR PEDIDO
// =============================================================
public class FinalizarPedidoRequest
{
    public List<ItemCarrinhoRequest> Itens { get; set; }
        = new();

    public string? Telefone { get; set; }

    public string? Cpf { get; set; }

    public string? Cep { get; set; }

    public string? Endereco { get; set; }

    public string? Numero { get; set; }

    public string? Complemento { get; set; }

    public string? Bairro { get; set; }

    public string? Cidade { get; set; }

    public string? Estado { get; set; }

    public string? FormaPagamento { get; set; }
}


// =============================================================
// DTO - ITEM DO CARRINHO
// =============================================================
public class ItemCarrinhoRequest
{
    public int ProdutoId { get; set; }

    public int Quantidade { get; set; }
}