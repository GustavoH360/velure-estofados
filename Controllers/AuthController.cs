using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Velure.Data;
using Velure.Models;

namespace Velure.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly PasswordHasher<Cliente> _passwordHasher;

    public AuthController(AppDbContext context)
    {
        _context = context;

        _passwordHasher =
            new PasswordHasher<Cliente>();
    }


    // ==============================
    // CADASTRO
    // ==============================

    [HttpPost("cadastro")]
    public async Task<IActionResult> Cadastro(
        [FromBody] CadastroRequest request
    )
    {
        if (
            string.IsNullOrWhiteSpace(request.Nome) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Senha)
        )
        {
            return BadRequest(new
            {
                mensagem = "Preencha todos os campos."
            });
        }


        if (request.Senha.Length < 6)
        {
            return BadRequest(new
            {
                mensagem =
                    "A senha deve ter pelo menos 6 caracteres."
            });
        }


        var email =
            request.Email
                .Trim()
                .ToLowerInvariant();


        var emailExiste =
            await _context.Clientes
                .AnyAsync(c => c.Email == email);


        if (emailExiste)
        {
            return BadRequest(new
            {
                mensagem =
                    "Este e-mail já está cadastrado."
            });
        }


        var cliente = new Cliente
        {
            Nome = request.Nome.Trim(),
            Email = email,
            CriadoEm = DateTime.Now,
            Ativo = true
        };


        cliente.SenhaHash =
            _passwordHasher.HashPassword(
                cliente,
                request.Senha
            );


        _context.Clientes.Add(cliente);

        await _context.SaveChangesAsync();


        return Ok(new
        {
            mensagem =
                "Cadastro realizado com sucesso."
        });
    }



    // ==============================
    // LOGIN
    // ==============================

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request
    )
    {
        if (
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Senha)
        )
        {
            return BadRequest(new
            {
                mensagem =
                    "Informe o e-mail e a senha."
            });
            
        }

           


        var email =
            request.Email
                .Trim()
                .ToLowerInvariant();


        var cliente =
            await _context.Clientes
                .FirstOrDefaultAsync(
                    c =>
                        c.Email == email &&
                        c.Ativo
                );


        if (cliente == null)
        {
            return Unauthorized(new
            {
                mensagem =
                    "E-mail ou senha incorretos."
            });
        }


        var resultado =
            _passwordHasher.VerifyHashedPassword(
                cliente,
                cliente.SenhaHash,
                request.Senha
            );


        if (
            resultado ==
            PasswordVerificationResult.Failed
        )
        {
            return Unauthorized(new
            {
                mensagem =
                    "E-mail ou senha incorretos."
            });
        }


        var claims = new List<Claim>
{
    new Claim(
        ClaimTypes.NameIdentifier,
        cliente.Id.ToString()
    ),

    new Claim(
        ClaimTypes.Name,
        cliente.Nome
    ),

    new Claim(
        ClaimTypes.Email,
        cliente.Email
    ),

    new Claim(
        ClaimTypes.Role,
        cliente.IsAdmin
            ? "Admin"
            : "Cliente"
    )
};


        var identity =
            new ClaimsIdentity(
                claims,
                CookieAuthenticationDefaults
                    .AuthenticationScheme
            );


        var principal =
            new ClaimsPrincipal(identity);


        var propriedades =
            new AuthenticationProperties
            {
                IsPersistent = true
            };


        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults
                .AuthenticationScheme,
            principal,
            propriedades
        );


        return Ok(new
        {
            mensagem =
                "Login realizado com sucesso.",

            cliente = new
            {
                cliente.Id,
                cliente.Nome,
                cliente.Email
            }
        });
    }



    // ==============================
    // USUÁRIO LOGADO
    // ==============================

  [HttpGet("me")]
public IActionResult Me()
{
    if (
        User.Identity == null ||
        !User.Identity.IsAuthenticated
    )
    {
        return Unauthorized();
    }

    return Ok(new
    {
        autenticado = true,

        cliente = new
        {
            id =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                ),

            nome =
                User.FindFirstValue(
                    ClaimTypes.Name
                ),

            email =
                User.FindFirstValue(
                    ClaimTypes.Email
                ),

            role =
                User.FindFirstValue(
                    ClaimTypes.Role
                )
        }
    });
}



    // ==============================
    // LOGOUT
    // ==============================

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(
            CookieAuthenticationDefaults
                .AuthenticationScheme
        );


        return Ok(new
        {
            mensagem =
                "Logout realizado com sucesso."
        });
    }
}


// ==============================
// REQUESTS
// ==============================

public class CadastroRequest
{
    public string Nome { get; set; }
        = string.Empty;

    public string Email { get; set; }
        = string.Empty;

    public string Senha { get; set; }
        = string.Empty;
}


public class LoginRequest
{
    public string Email { get; set; }
        = string.Empty;

    public string Senha { get; set; }
        = string.Empty;
}