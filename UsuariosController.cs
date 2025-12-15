using Microsoft.AspNetCore.Mvc;

namespace JCGamesAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        // Lista temporária em memória (simula o banco de dados)
        private static List<Usuario> usuarios = new();

        // Classe interna representando o usuário (por enquanto)
        public class Usuario
        {
            public int Id { get; set; }
            public string Nome { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Senha { get; set; } = string.Empty;
        }

        // POST: api/usuarios/registrar
        [HttpPost("registrar")]
        public IActionResult Registrar([FromBody] Usuario novoUsuario)
        {
            if (usuarios.Any(u => u.Email == novoUsuario.Email))
                return BadRequest("E-mail já cadastrado.");

            novoUsuario.Id = usuarios.Count + 1;
            usuarios.Add(novoUsuario);
            return Ok("Usuário cadastrado com sucesso!");
        }

        // POST: api/usuarios/login
        [HttpPost("login")]
        public IActionResult Login([FromBody] Usuario login)
        {
            var usuario = usuarios.FirstOrDefault(u =>
                u.Email == login.Email && u.Senha == login.Senha);

            if (usuario == null)
                return Unauthorized("E-mail ou senha incorretos.");

            return Ok($"Bem-vindo, {usuario.Nome}!");
        }
    }
}
