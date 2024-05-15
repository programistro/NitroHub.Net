using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Components;
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
            var user = _context.Users.FirstOrDefault(x => x.Email == viewModel.Email);

            if (user != null)
            {
                var claims = new List<Claim> { new Claim(ClaimTypes.Name, user.Email) };
                // создаем объект ClaimsIdentity
                ClaimsIdentity claimsIdentity = new ClaimsIdentity(claims, "Cookies");
                // установка аутентификационных куки
                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity));
            }
            
            return RedirectToAction("Index", "Home");
        }

        return RedirectToAction("Index", "Home");
    }
    
    [HttpGet("google-login")]
    public async Task<ActionResult> Google()
    {
        var prop = new AuthenticationProperties
        {
            RedirectUri = "/"
        };
        return Challenge(prop, GoogleDefaults.AuthenticationScheme);
    }

    [Inject]
    public NavigationManager NavigationManager { get; set; }

    [AllowAnonymous]
    [HttpGet("signout")]
    public async Task<ActionResult> signout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        var prop = new AuthenticationProperties
        {
            RedirectUri = "/logout-complete"
        };

        return Redirect("/");
    }

    [HttpGet("logout-complete")]
    [AllowAnonymous]
    public string logoutComplete()
    {
        return "logout-complete";
    }

    public IActionResult YourAction()
    {
        // Выполняем навигацию на другую страницу с помощью метода NavigateTo()
        NavigationManager.NavigateTo("/");

        // Если требуется вернуть результат обратно на страницу,
        // можно использовать метод Redirect()
        return Redirect("/");
    }

    [HttpGet("singin")]
    public async Task<ActionResult> Singin(string email)
    {
        // создаем один claim
        var claims = new List<Claim>
        {
            new Claim(ClaimsIdentity.DefaultNameClaimType, email)
        };
        // создаем объект ClaimsIdentity
        ClaimsIdentity id = new ClaimsIdentity(claims, "LoginScheme", ClaimsIdentity.DefaultNameClaimType, ClaimsIdentity.DefaultRoleClaimType);
        // установка аутентификационных куки
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(id));

        var prop = new AuthenticationProperties
        {
            RedirectUri = "/"
        };
        return Redirect("/");
    }
}