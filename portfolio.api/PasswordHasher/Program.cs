using BCrypt.Net;

string password = "Test123!";
string hash = BCrypt.Net.BCrypt.HashPassword(password);
Console.WriteLine($"Password: {password}");
Console.WriteLine($"Hash: {hash}");

