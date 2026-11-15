$(document).ready(function () {

    AddCliente();
    AddMascaraCPF();
    ConsultaClientePorCampoCPF();
    ValidaCampoNome();
})

function ModalDialog(titulo, texto) {
    var random = Math.random().toString().replace('.', '');
    var texto = '<div id="' + random + '" class="modal fade">                                                               ' +
        '        <div class="modal-dialog">                                                                                 ' +
        '            <div class="modal-content">                                                                            ' +
        '                <div class="modal-header">                                                                         ' +
        '                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>         ' +
        '                    <h4 class="modal-title">' + titulo + '</h4>                                                    ' +
        '                </div>                                                                                             ' +
        '                <div class="modal-body">                                                                           ' +
        '                    <p>' + texto + '</p>                                                                           ' +
        '                </div>                                                                                             ' +
        '                <div class="modal-footer">                                                                         ' +
        '                    <button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>             ' +
        '                                                                                                                   ' +
        '                </div>                                                                                             ' +
        '            </div><!-- /.modal-content -->                                                                         ' +
        '  </div><!-- /.modal-dialog -->                                                                                    ' +
        '</div> <!-- /.modal -->                                                                                        ';

    $('body').append(texto);
    $('#' + random).modal('show');
}


function ModalEscolhaBeneficiario(cpf, clientId) {

    var random = Math.random().toString().replace('.', '');

    var html = `
        <div id="${random}" class="modal fade" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">

                    <div class="modal-header">
                        <h4 class="modal-title">Beneficiário já cadastrado</h4>
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
                    </div>

                    <div class="modal-body">
                        <p>
                            Este cliente ${cpf} já possui cadastro.
                            Deseja alterar os dados cadastrais
                            ou incluir um novo beneficiário?
                        </p>
                    </div>

                    <div class="modal-footer">

                        <button type="button"
                                onclick="window.location.href='/Cliente/Alterar/${clientId}'"
                                class="btn btn-primary"
                                id="btnAlterarCadastro">
                            Alterar Cadastro
                        </button>

                        <button type="button"
                                class="btn btn-success"
                                id="btnNovoBeneficiario">
                            Incluir Novo Beneficiário
                        </button>

                        <button type="button"
                                class="btn btn-default"
                                data-dismiss="modal">
                            Cancelar
                        </button>

                    </div>

                </div>
            </div>
        </div>`;

    $('body').append(html);

    var modal = $('#' + random);

    modal.modal('show');

    modal.find('#btnAlterarCadastro').on('click', function () {

        modal.modal('hide');

        console.log('Alterar cadastro do cliente');

    });

    modal.find('#btnNovoBeneficiario').on('click', function () {

        modal.modal('hide');

        console.log('Incluir novo beneficiário');

    });

    modal.on('hidden.bs.modal', function () {
        modal.remove();
    });
}

function AddCliente() {
    $('#formCadastro').submit(function (e) {
        e.preventDefault();

        var $form = $(this);

        var cpfSemMascara = removerMascaraCPF($form.find('#CPF').val());
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

function ValidaCampoNome()
{
    $('#formCadastro #Nome').on('blur', function () {
        var nome = $(this).val();
        if ((nome || nome.trim() !== "")
            && !/^[A-Za-zÀ-ÿ\s]+$/.test(nome)) {
            ModalDialog(
                "Nome inválido",
                "O nome deve conter apenas letras."
            );

        }
        return;
    });
}