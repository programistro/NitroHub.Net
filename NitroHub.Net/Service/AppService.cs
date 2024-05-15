using Yandex.Checkout.V3;

namespace NitroHub.Net.Service;

public class AppService
{
    private readonly IHttpContextAccessor  _context;

    public AppService(IHttpContextAccessor  context)
    {
        _context = context;
    }
    
    public bool IsPaid()
    {
        var client = new Yandex.Checkout.V3.Client(
            shopId: "379664", 
            secretKey: "test_Z77GQZ8DVsDi2xF1SoCPzvHu7qlBL1b5R2dlQRiVdK0");
        
        var notification = Client.ParseMessage(_context.HttpContext.Request.Method, _context.HttpContext.Request.ContentType, _context.HttpContext.Request.Body);

        if (notification is PaymentWaitingForCaptureNotification paymentWaitingForCaptureNotification)
        {
            Payment payment = paymentWaitingForCaptureNotification.Object;
        
            if (payment.Paid)
            {
                // 4. Подтвердите готовность принять платеж
                client.CapturePayment(payment.Id);
                Console.WriteLine("Paid");
                return true;
            }
            else
            {
                return false;
                Console.WriteLine("No paid");
            }
        }

        return false;
    }
}