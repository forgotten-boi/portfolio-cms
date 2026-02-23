using BCrypt.Net;
string[] passwords = { ""Admin@123!"", ""Member@123!"", ""Guest@123!"" };
foreach (var p in passwords) {
    string hash = BCrypt.Net.BCrypt.HashPassword(p);
    Console.WriteLine($""{p}|{hash}"");
}
