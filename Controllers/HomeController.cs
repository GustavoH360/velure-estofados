using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Velure.Data;

namespace Velure.Controllers;

public class HomeController : Controller
{
    private readonly AppDbContext _context;

    public HomeController(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IActionResult> Index()
    {
        var produtos = await _context.Produtos
            .Where(p => p.Ativo)
            .ToListAsync();

        return View(produtos);
    }
}