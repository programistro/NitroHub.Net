using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using NitroHub.Net.Data;
using NitroHub.Net.Models;

namespace NitroHub.Net.Controllers;

public class AuthController : Controller
{
    private readonly ILogger<AuthController> _logger;

    private readonly UserDbContext _context;

    public AuthController(ILogger<AuthController> logger, UserDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Auth(AuthViewModel viewModel, string type)
    {
        if(type == "reg")
        {
            User user = new User()
            {
                Email = viewModel.Email,
                PasswordHash = viewModel.Password
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var claims = new List<Claim> { new Claim(ClaimTypes.Name, user.Email) };
            // создаем объект ClaimsIdentity
            ClaimsIdentity claimsIdentity = new ClaimsIdentity(claims, "Cookies");
            // установка аутентификационных куки
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity));

            return RedirectToAction("Index", "Home");
        }
        else if(type == "login")
        {
            return RedirectToAction("Index", "Home");
        }

        return RedirectToAction("Index", "Home");
    }
}