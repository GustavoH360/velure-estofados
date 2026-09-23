using Microsoft.EntityFrameworkCore;
using Velure.Data;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);

var culturaBrasileira = new CultureInfo("pt-BR");
CultureInfo.DefaultThreadCurrentCulture = culturaBrasileira;
CultureInfo.DefaultThreadCurrentUICulture = culturaBrasileira;

builder.Services.AddControllersWithViews();
builder.Services
    .AddAuthentication(
        CookieAuthenticationDefaults.AuthenticationScheme
    )
 
   .AddCookie(options =>
    {
        options.Cookie.Name = "Velure.Auth";
        options.LoginPath = "/";
        options.AccessDeniedPath = "/";
        options.ExpireTimeSpan = TimeSpan.FromDays(7);
        options.SlidingExpiration = true;
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
    });


var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "A ConnectionString 'DefaultConnection' não foi encontrada."
    );



builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySQL(connectionString)
);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}



if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();