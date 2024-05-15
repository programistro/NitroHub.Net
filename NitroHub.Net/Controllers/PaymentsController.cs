using Microsoft.AspNetCore.Mvc;
using Yandex.Checkout.V3;

namespace NitroHub.Net.Controllers;

public class PaymentController : Controller
{
    private readonly ILogger<PaymentController> _logger;
    
    public async Task<IActionResult> ProcessPayment()
    {
        // Получение HttpContext из параметра метода
        var httpContext = HttpContext;

        // Использование HttpContext для доступа к Request
        var request = httpContext.Request;

        // Пример использования Request
        var method = request.Method; // Получение метода HTTP-запроса
        var contentType = request.ContentType; // Получение типа контента

        var client = new Yandex.Checkout.V3.Client(
            shopId: "379664", 
            secretKey: "test_Z77GQZ8DVsDi2xF1SoCPzvHu7qlBL1b5R2dlQRiVdK0");
    
// 1. Создайте платеж и получите ссылку для оплаты
        var newPayment = new NewPayment
        {
            Amount = new Amount { Value = 100.00m, Currency = "RUB" },
            Confirmation = new Confirmation { 
                Type = ConfirmationType.Redirect,
                ReturnUrl = "https://localhost:7214/"
            }
        };
        Payment payment = client.CreatePayment(newPayment);
    
// 2. Перенаправьте пользователя на страницу оплаты
        string url = payment.Confirmation.ConfirmationUrl;
        Console.WriteLine(url);

        var notification = Client.ParseMessage(HttpContext.Request.Method, HttpContext.Request.ContentType, HttpContext.Request.Body);

        if (notification is PaymentWaitingForCaptureNotification paymentWaitingForCaptureNotification)
        {
            Payment payment1 = paymentWaitingForCaptureNotification.Object;
        
            if (payment1.Paid)
            {
                // 4. Подтвердите готовность принять платеж
                client.CapturePayment(payment.Id);
            }
        } 
        
        return Redirect(url);
    }
}