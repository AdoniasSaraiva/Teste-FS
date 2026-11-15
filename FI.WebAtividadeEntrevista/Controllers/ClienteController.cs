using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using FI.AtividadeEntrevista.BLL;
using FI.AtividadeEntrevista.DML;
using FI.WebAtividadeEntrevista.Validation;
using WebAtividadeEntrevista.Models;

namespace WebAtividadeEntrevista.Controllers
{
    public class ClienteController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }


        public ActionResult Incluir()
        {
            return View();
        }

        [HttpPost]
        public JsonResult Incluir(ClienteModel model)
        {
            BoCliente bo = new BoCliente();

            if (!this.ModelState.IsValid)
            {
                List<string> erros = (from item in ModelState.Values
                                      from error in item.Errors
                                      select error.ErrorMessage).ToList();

                Response.StatusCode = 400;
                return Json(string.Join(Environment.NewLine, erros));
            }

            if (ValidationBeneficiario.VerificaCPFBeneficiario(model.Beneficiarios, model.CPF))
            {
                Response.StatusCode = 400;
                return Json("O CPF do beneficiário não pode ser igual ao CPF do cliente.");
            }
            else
            {

                model.Id = bo.Incluir(new Cliente()
                {
                    CPF = model.CPF,
                    CEP = model.CEP,
                    Cidade = model.Cidade,
                    Email = model.Email,
                    Estado = model.Estado,
                    Logradouro = model.Logradouro,
                    Nacionalidade = model.Nacionalidade,
                    Nome = model.Nome,
                    Sobrenome = model.Sobrenome,
                    Telefone = model.Telefone
                });

                if (model.Beneficiarios != null && model.Beneficiarios.Count > 0)
                {
                    foreach (BeneficiarioModel beneficiarioModel in model.Beneficiarios)
                    {
                        Beneficiario beneficiario = new Beneficiario
                        {
                            IdCliente = model.Id,
                            Nome = beneficiarioModel.Nome,
                            CPF = beneficiarioModel.CPF
                        };

                        new BoBeneficiario().Incluir(beneficiario);
                    }
                }

                return Json("Cadastro efetuado com sucesso");
            }
        }

        [HttpPost]
        public JsonResult Alterar(ClienteModel model)
        {
            try
            {
                BoCliente bo = new BoCliente();
                BoBeneficiario boBeneficiario = new BoBeneficiario();

                if (!this.ModelState.IsValid)
                {
                    List<string> erros = (from item in ModelState.Values
                                          from error in item.Errors
                                          select error.ErrorMessage).ToList();

                    Response.StatusCode = 400;
                    return Json(string.Join(Environment.NewLine, erros));
                }

                if (ValidationBeneficiario.VerificaCPFBeneficiario(model.Beneficiarios, model.CPF))
                {
                    Response.StatusCode = 400;

                    return Json("O CPF do beneficiário não pode ser igual ao CPF do cliente");
                }

                bo.Alterar(new Cliente()
                {
                    Id = model.Id,
                    CEP = model.CEP,
                    Cidade = model.Cidade,
                    Email = model.Email,
                    Estado = model.Estado,
                    Logradouro = model.Logradouro,
                    Nacionalidade = model.Nacionalidade,
                    Nome = model.Nome,
                    Sobrenome = model.Sobrenome,
                    Telefone = model.Telefone,
                    CPF = model.CPF
                });

                List<Beneficiario> beneficiariosAtuais = boBeneficiario.Listar(model.Id);

                if (model.Beneficiarios != null && model.Beneficiarios.Count > 0)
                {
                    foreach (BeneficiarioModel beneficiarioModel in model.Beneficiarios)
                    {
                        Beneficiario beneficiarioExistente = beneficiariosAtuais.FirstOrDefault(beneAtuais => beneAtuais.CPF == beneficiarioModel.CPF);

                        Beneficiario beneficiarioDml = new Beneficiario
                        {
                            IdCliente = model.Id,
                            Nome = beneficiarioModel.Nome,
                            CPF = beneficiarioModel.CPF
                        };

                        if (beneficiarioExistente != null)
                        {
                            beneficiarioDml.Id = beneficiarioExistente.Id;
                            boBeneficiario.Alterar(beneficiarioDml);
                        }
                        else
                            boBeneficiario.Incluir(beneficiarioDml);
                    }
                }

                var cpfsAtualizados = model.Beneficiarios?.Select(b => b.CPF).ToList() ?? new List<string>();
                var beneficiariosParaRemover = beneficiariosAtuais.Where(ba => !cpfsAtualizados.Contains(ba.CPF));

                foreach (Beneficiario beneficiario in beneficiariosParaRemover)
                {
                    boBeneficiario.ExcluirBeneficiario(beneficiario.Id);
                }

                return Json("Cadastro alterado com sucesso");
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }
        }

        [HttpGet]
        public ActionResult Alterar(long id)
        {
            BoCliente bo = new BoCliente();
            Cliente cliente = bo.Consultar(id);
            Models.ClienteModel model = null;
            BoBeneficiario boBeneficiario = new BoBeneficiario();

            if (cliente != null)
            {
                model = new ClienteModel()
                {
                    Id = cliente.Id,
                    CEP = cliente.CEP,
                    CPF = cliente.CPF,
                    Cidade = cliente.Cidade,
                    Email = cliente.Email,
                    Estado = cliente.Estado,
                    Logradouro = cliente.Logradouro,
                    Nacionalidade = cliente.Nacionalidade,
                    Nome = cliente.Nome,
                    Sobrenome = cliente.Sobrenome,
                    Telefone = cliente.Telefone
                };
            }

            List<Beneficiario> beneficiarios = boBeneficiario.Listar(cliente.Id);

            model.Beneficiarios = beneficiarios.Select(b => new BeneficiarioModel
            {
                Id = b.Id,
                Nome = b.Nome,
                CPF = b.CPF
            }).ToList();

            return View(model);
        }

        [HttpPost]
        public JsonResult ClienteList(int jtStartIndex = 0, int jtPageSize = 0, string jtSorting = null)
        {
            try
            {
                int qtd = 0;
                string campo = string.Empty;
                string crescente = string.Empty;
                string[] array = jtSorting.Split(' ');

                if (array.Length > 0)
                    campo = array[0];

                if (array.Length > 1)
                    crescente = array[1];

                List<Cliente> clientes = new BoCliente().Pesquisa(jtStartIndex, jtPageSize, campo, crescente.Equals("ASC", StringComparison.InvariantCultureIgnoreCase), out qtd);

                //Return result to jTable
                return Json(new { Result = "OK", Records = clientes, TotalRecordCount = qtd });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }

        [HttpGet]
        public JsonResult CpfClienteExiste(string cpf)
        {
            try
            {
                BoCliente bo = new BoCliente();

                bool clienteExiste = bo.VerificarExistenciaClientePorCPF(cpf);

                return Json(new { existe = clienteExiste },  JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}
