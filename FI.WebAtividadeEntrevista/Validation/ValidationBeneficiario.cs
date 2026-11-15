using System.Collections.Generic;
using System.Linq;
using WebAtividadeEntrevista.Models;

namespace FI.WebAtividadeEntrevista.Validation
{
    public class ValidationBeneficiario
    {
        public static bool VerificaCPFBeneficiario(List<BeneficiarioModel> beneficiarioModels, string ClienteCpf)
        {
            return beneficiarioModels.Any(x => x.CPF == ClienteCpf);
        }
    }
}