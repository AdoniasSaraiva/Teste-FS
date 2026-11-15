
$(document).ready(function () {
    if (obj) {
        $('#formCadastro #Nome').val(obj.Nome);
        $('#formCadastro #CEP').val(obj.CEP);
        $('#formCadastro #CPF').val(obj.CPF);
        $('#formCadastro #Email').val(obj.Email);
        $('#formCadastro #Sobrenome').val(obj.Sobrenome);
        $('#formCadastro #Nacionalidade').val(obj.Nacionalidade);
        $('#formCadastro #Estado').val(obj.Estado);
        $('#formCadastro #Cidade').val(obj.Cidade);
        $('#formCadastro #Logradouro').val(obj.Logradouro);
        $('#formCadastro #Telefone').val(obj.Telefone);

        if (obj.Beneficiarios != null && obj.Beneficiarios.length > 0) {
            beneficiariosExistentes = obj.Beneficiarios.map(function (b) {
                return {
                    Id: b.Id,
                    cpf: b.CPF,
                    nome: b.Nome
                };
            });

            beneficiarios = beneficiarios.concat(beneficiariosExistentes);

            renderizarGridBeneficiarios();
        }
    }

    AlterarCliente();
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

function AlterarCliente()
{
    $('#formCadastro').submit(function (e) {
        e.preventDefault();

        var $form = $(this);
        var idCliente = (typeof obj !== 'undefined' && obj && obj.Id) ? obj.Id : $form.find('#Id').val();
        var cpfSemMascara = removerMascaraCPF($form.find('#CPF').val());
        $form.find('#CPF').val(cpfSemMascara);

        var formData = new FormData();
        formData.append("Id", idCliente);
        formData.append("NOME", $form.find("#Nome").val());
        formData.append("CEP", $form.find("#CEP").val());
        formData.append("Email", $form.find("#Email").val());
        formData.append("Sobrenome", $form.find("#Sobrenome").val());
        formData.append("Nacionalidade", $form.find("#Nacionalidade").val());
        formData.append("Estado", $form.find("#Estado").val());
        formData.append("Cidade", $form.find("#Cidade").val());
        formData.append("Logradouro", $form.find("#Logradouro").val());
        formData.append("Telefone", $form.find("#Telefone").val());
        formData.append("CPF", cpfSemMascara);


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
                function (response) {
                    ModalDialog("Sucesso!", response)
                    $("#formCadastro")[0].reset();
                    setTimeout(function () {
                        window.location.href = urlRetorno;
                    }, 3000);
                }
        });
    })
}
