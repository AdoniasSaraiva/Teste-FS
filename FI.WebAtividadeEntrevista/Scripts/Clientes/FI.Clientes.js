$(document).ready(function () {
    AddCliente();
    AddMascaraCPF();
    ConsultaClientePorCampoCPF();
})

function AddCliente() {
    $('#formCadastro').submit(function (e) {
        e.preventDefault();

        var $form = $(this);

        var cpfSemMascara = removerMascaraCPF($form.find('#CPF').val());

        if (!validarCPF(cpfSemMascara)) {
            ModalDialog("CPF Invalido", "Por favor, informe um CPF valido.");
            $('#formCadastro #CPF').val('');
            return;
        }

        $form.find('#CPF').val(cpfSemMascara);

        var formData = new FormData($form[0]);

        if (typeof beneficiarios !== 'undefined' && beneficiarios.length > 0) {
            for (var i = 0; i < beneficiarios.length; i++) {
                formData.append('Beneficiarios[' + i + '].nome', beneficiarios[i].nome);
                formData.append('Beneficiarios[' + i + '].cpf', beneficiarios[i].cpf);
            }
        }

        $.ajax({
            url: urlPost,
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            error:
                function (r) {
                    if (r.status == 400)
                        ModalDialog("Ocorreu um erro", r.responseJSON);
                    else if (r.status == 500)
                        ModalDialog("Ocorreu um erro", "Ocorreu um erro interno no servidor.");
                },
            success:
                function (r) {
                    ModalDialog("Sucesso!", r)
                    $("#formCadastro")[0].reset();
                }
        });
    })

}

function AddMascaraCPF() {
    $('#formCadastro #CPF').on('input', function () {
        var cpf = $(this).val().replace(/\D/g, '');

        cpf = cpf.substring(0, 11);

        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
        cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

        $(this).val(cpf);
    });
}

function ConsultaClientePorCampoCPF() {
    $('#CPF').on('blur', function () {
        var cpf = $(this).val();
        if (!cpf) {
            return;
        }

        $.ajax({
            url: '/Cliente/CpfClienteExiste',
            type: 'GET',
            data: { cpf: cpf.replace(/\D/g, '') },

            success: function (response) {

                if (response.existe) {
                    ModalDialog("CPF Existe", "Este CPF já está cadastrado");
                    $('#formCadastro #CPF').val('');
                }
            },
            error: function (xhr) {
                console.error('Erro ao consultar cliente:', xhr);
            }
        });

    });
}