using System.Security.Cryptography;
using System.Text;

namespace NitroHub.Net.Service;

public class AccountService
{
    public string CreateHash()
    {
        Guid randomGuid = Guid.NewGuid();
        string randomHash = randomGuid.ToString("N");

        return randomHash;
    }

    public async Task<string> CreatePasswordHash(string password)
    {
        using (SHA256 sha = SHA256.Create())
        {
            byte[] hashValue = sha.ComputeHash(Encoding.UTF8.GetBytes(password));

            StringBuilder builder = new StringBuilder();
            for (int i = 0; i < hashValue.Length; i++)
            {
                builder.Append(hashValue[i].ToString("x2")); // Преобразуем байты хэша в шестнадцатеричное представление
            }

            return builder.ToString();
        }
    }

}
