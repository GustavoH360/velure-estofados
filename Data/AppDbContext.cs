using Microsoft.EntityFrameworkCore;
using Velure.Models;

namespace Velure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(
        DbContextOptions<AppDbContext> options
    ) : base(options)
    {
    }

    public DbSet<Produto> Produtos =>
        Set<Produto>();

    public DbSet<Cliente> Clientes =>
        Set<Cliente>();

    public DbSet<Pedido> Pedidos =>
        Set<Pedido>();

    public DbSet<ItemPedido> ItensPedido =>
        Set<ItemPedido>();


    protected override void OnModelCreating(
        ModelBuilder modelBuilder
    )
    {
        base.OnModelCreating(modelBuilder);


        // ==============================
        // PRODUTOS
        // ==============================

        modelBuilder.Entity<Produto>()
            .Property(p => p.Preco)
            .HasPrecision(18, 2);


        modelBuilder.Entity<Produto>()
            .Property(p => p.PrecoAntigo)
            .HasPrecision(18, 2);



        // ==============================
        // PEDIDOS
        // ==============================

        modelBuilder.Entity<Pedido>()
            .Property(p => p.Total)
            .HasPrecision(18, 2);


        modelBuilder.Entity<ItemPedido>()
            .Property(i => i.PrecoUnitario)
            .HasPrecision(18, 2);


        modelBuilder.Entity<ItemPedido>()
            .Property(i => i.Subtotal)
            .HasPrecision(18, 2);



        // Cliente -> Pedidos

        modelBuilder.Entity<Pedido>()
            .HasOne(p => p.Cliente)
            .WithMany()
            .HasForeignKey(p => p.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);



        // Pedido -> Itens

        modelBuilder.Entity<ItemPedido>()
            .HasOne(i => i.Pedido)
            .WithMany(p => p.Itens)
            .HasForeignKey(i => i.PedidoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}