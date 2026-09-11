using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Velure.Data;
using Velure.Models;

namespace Velure.Controllers;

[Authorize(Roles = "Admin")]
public class AdminController : Controller
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    // ==========================================
    // DASHBOARD
    // ==========================================

   [HttpGet]
public async Task<IActionResult> Index()
{
    var pedidosValidos =
        _context.Pedidos
            .Where(p => p.Status != "Cancelado");

    var totalProdutos =
        await _context.Produtos
            .CountAsync(p => p.Ativo);

    var totalClientes =
        await _context.Clientes
            .CountAsync(c => c.Ativo);

    var totalPedidos =
        await pedidosValidos.CountAsync();

    var estoqueBaixo =
        await _context.Produtos
            .CountAsync(p =>
                p.Ativo &&
                p.Estoque <= 5);

    var faturamento =
        await pedidosValidos
            .SumAsync(p => (decimal?)p.Total)
        ?? 0;

    var ticketMedio =
        totalPedidos > 0
            ? faturamento / totalPedidos
            : 0;

    var produtoMaisVendido =
        await _context.ItensPedido
            .Where(i =>
                i.Pedido.Status != "Cancelado")
            .GroupBy(i => i.NomeProduto)
            .Select(g => new
            {
                Nome = g.Key,
                Quantidade = g.Sum(i => i.Quantidade)
            })
            .OrderByDescending(x => x.Quantidade)
            .FirstOrDefaultAsync();

    var pedidosRecentes =
        await _context.Pedidos
            .Include(p => p.Cliente)
            .OrderByDescending(p => p.CriadoEm)
            .Take(5)
            .ToListAsync();

    ViewBag.TotalProdutos = totalProdutos;
    ViewBag.TotalClientes = totalClientes;
    ViewBag.TotalPedidos = totalPedidos;
    ViewBag.EstoqueBaixo = estoqueBaixo;
    ViewBag.Faturamento = faturamento;
    ViewBag.TicketMedio = ticketMedio;

    ViewBag.ProdutoMaisVendido =
        produtoMaisVendido?.Nome
        ?? "Nenhuma venda";

    ViewBag.QuantidadeMaisVendida =
        produtoMaisVendido?.Quantidade
        ?? 0;

var hoje = DateTime.Today;

var inicioPeriodo = hoje.AddDays(-6);

var vendasPorDia =
    await _context.Pedidos
        .Where(p =>
            p.Status != "Cancelado" &&
            p.CriadoEm >= inicioPeriodo)
        .GroupBy(p => p.CriadoEm.Date)
        .Select(g => new
        {
            Data = g.Key,
            Total = g.Sum(p => p.Total)
        })
        .OrderBy(x => x.Data)
        .ToListAsync();

var labelsGrafico = new List<string>();
var valoresGrafico = new List<decimal>();

for (int i = 0; i < 7; i++)
{
    var dia = inicioPeriodo.AddDays(i);

    labelsGrafico.Add(
        dia.ToString("dd/MM")
    );

    var vendaDia =
        vendasPorDia
            .FirstOrDefault(v => v.Data == dia);

    valoresGrafico.Add(
        vendaDia?.Total ?? 0
    );
}

ViewBag.LabelsGrafico =
    labelsGrafico;

ViewBag.ValoresGrafico =
    valoresGrafico;

    return View(pedidosRecentes);
}

    // ==========================================
    // PRODUTOS
    // ==========================================

    [HttpGet]
    public async Task<IActionResult> Produtos()
    {
        var produtos = await _context.Produtos
            .OrderBy(p => p.Nome)
            .ToListAsync();

        return View(produtos);
    }

    // ==========================================
    // CRIAR PRODUTO - GET
    // ==========================================

    [HttpGet]
    public IActionResult CriarProduto()
    {
        return View(new Produto());
    }

    // ==========================================
    // CRIAR PRODUTO - POST
    // ==========================================

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CriarProduto(
        Produto produto,
        IFormFile? imagem)
    {
        if (!ModelState.IsValid)
        {
            return View(produto);
        }

        if (imagem != null && imagem.Length > 0)
        {
            var resultadoImagem = await SalvarImagemProduto(imagem);

            if (!resultadoImagem.Sucesso)
            {
                ModelState.AddModelError(
                    "",
                    resultadoImagem.Erro ?? "Imagem inválida."
                );

                return View(produto);
            }

            produto.ImagemUrl = resultadoImagem.Caminho;
        }

        produto.Nome = produto.Nome.Trim();
        produto.Categoria = produto.Categoria.Trim();

        produto.Cor = string.IsNullOrWhiteSpace(produto.Cor)
            ? null
            : produto.Cor.Trim();

        produto.Parcelamento = string.IsNullOrWhiteSpace(produto.Parcelamento)
            ? null
            : produto.Parcelamento.Trim();

        _context.Produtos.Add(produto);
        await _context.SaveChangesAsync();

        TempData["Sucesso"] = "Produto cadastrado com sucesso.";

        return RedirectToAction(nameof(Produtos));
    }

    // ==========================================
    // EDITAR PRODUTO - GET
    // ==========================================

    [HttpGet]
    public async Task<IActionResult> EditarProduto(int id)
    {
        var produto = await _context.Produtos.FindAsync(id);

        if (produto == null)
        {
            return NotFound();
        }

        return View(produto);
    }

    // ==========================================
    // EDITAR PRODUTO - POST
    // ==========================================

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> EditarProduto(
        int id,
        Produto produto,
        IFormFile? imagem)
    {
        if (id != produto.Id)
        {
            return BadRequest();
        }

        var produtoBanco = await _context.Produtos.FindAsync(id);

        if (produtoBanco == null)
        {
            return NotFound();
        }

        if (!ModelState.IsValid)
        {
            return View(produto);
        }

        if (imagem != null && imagem.Length > 0)
        {
            var resultadoImagem = await SalvarImagemProduto(imagem);

            if (!resultadoImagem.Sucesso)
            {
                ModelState.AddModelError(
                    "",
                    resultadoImagem.Erro ?? "Imagem inválida."
                );

                produto.ImagemUrl = produtoBanco.ImagemUrl;
                return View(produto);
            }

            produtoBanco.ImagemUrl = resultadoImagem.Caminho;
        }

        produtoBanco.Nome = produto.Nome.Trim();
        produtoBanco.Categoria = produto.Categoria.Trim();

        produtoBanco.Cor = string.IsNullOrWhiteSpace(produto.Cor)
            ? null
            : produto.Cor.Trim();

        produtoBanco.Preco = produto.Preco;
        produtoBanco.PrecoAntigo = produto.PrecoAntigo;

        produtoBanco.Parcelamento = string.IsNullOrWhiteSpace(produto.Parcelamento)
            ? null
            : produto.Parcelamento.Trim();

        produtoBanco.Desconto = produto.Desconto;
        produtoBanco.Estoque = produto.Estoque;
        produtoBanco.Ativo = produto.Ativo;

        await _context.SaveChangesAsync();

        TempData["Sucesso"] = "Produto atualizado com sucesso.";

        return RedirectToAction(nameof(Produtos));
    }

    // ==========================================
    // ATIVAR / DESATIVAR PRODUTO
    // ==========================================

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AlternarStatusProduto(int id)
    {
        var produto = await _context.Produtos.FindAsync(id);

        if (produto == null)
        {
            return NotFound();
        }

        produto.Ativo = !produto.Ativo;

        await _context.SaveChangesAsync();

        TempData["Sucesso"] = produto.Ativo
            ? "Produto ativado com sucesso."
            : "Produto desativado com sucesso.";

        return RedirectToAction(nameof(Produtos));
    }

    // ==========================================
    // PEDIDOS
    // ==========================================

    [HttpGet]
    public async Task<IActionResult> Pedidos()
    {
        var pedidos = await _context.Pedidos
            .Include(p => p.Cliente)
            .Include(p => p.Itens)
            .OrderByDescending(p => p.CriadoEm)
            .ToListAsync();

        return View(pedidos);
    }

    // ==========================================
    // ALTERAR STATUS DO PEDIDO
    // ==========================================

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AlterarStatusPedido(
        int id,
        string status)
    {
        var statusPermitidos = new[]
        {
            "Pendente",
            "Em preparação",
            "Enviado",
            "Entregue",
            "Cancelado"
        };

        if (!statusPermitidos.Contains(status))
        {
            TempData["Erro"] = "Status inválido.";
            return RedirectToAction(nameof(Pedidos));
        }

        var pedido = await _context.Pedidos.FindAsync(id);

        if (pedido == null)
        {
            return NotFound();
        }

        pedido.Status = status;

        await _context.SaveChangesAsync();

        TempData["Sucesso"] =
            $"Pedido #{pedido.Id} atualizado para {status}.";

        return RedirectToAction(nameof(Pedidos));
    }

    // ==========================================
    // CLIENTES
    // ==========================================

    [HttpGet]
    public async Task<IActionResult> Clientes(string? busca)
    {
        var query = _context.Clientes.AsQueryable();

        if (!string.IsNullOrWhiteSpace(busca))
        {
            busca = busca.Trim();

            query = query.Where(c =>
                c.Nome.Contains(busca) ||
                c.Email.Contains(busca));
        }

        var clientes = await query
            .OrderByDescending(c => c.CriadoEm)
            .ToListAsync();

        ViewBag.Busca = busca;

        return View(clientes);
    }

    // ==========================================
    // SALVAR IMAGEM
    // ==========================================

    private async Task<ResultadoImagem> SalvarImagemProduto(
        IFormFile imagem)
    {
        var extensao = Path.GetExtension(imagem.FileName)
            .ToLowerInvariant();

        var extensoesPermitidas = new[]
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        };

        if (!extensoesPermitidas.Contains(extensao))
        {
            return new ResultadoImagem
            {
                Sucesso = false,
                Erro = "Formato de imagem inválido. Use JPG, JPEG, PNG ou WEBP."
            };
        }

        const long tamanhoMaximo = 5 * 1024 * 1024;

        if (imagem.Length > tamanhoMaximo)
        {
            return new ResultadoImagem
            {
                Sucesso = false,
                Erro = "A imagem deve possuir no máximo 5 MB."
            };
        }

        var pasta = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            "images",
            "produtos"
        );

        Directory.CreateDirectory(pasta);

        var nomeArquivo = $"{Guid.NewGuid()}{extensao}";

        var caminhoCompleto = Path.Combine(
            pasta,
            nomeArquivo
        );

        await using var stream = new FileStream(
            caminhoCompleto,
            FileMode.Create
        );

        await imagem.CopyToAsync(stream);

        return new ResultadoImagem
        {
            Sucesso = true,
            Caminho = $"/images/produtos/{nomeArquivo}"
        };
    }

    // ==========================================
    // RESULTADO DA IMAGEM
    // ==========================================

    private class ResultadoImagem
    {
        public bool Sucesso { get; set; }
        public string? Caminho { get; set; }
        public string? Erro { get; set; }
    }
}
