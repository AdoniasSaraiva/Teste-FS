var beneficiarios = [];
var beneficiarioEditando = null;
var beneficiariosExistentes = [];
var beneficiariosExcluidos = [];

$(document).ready(function () {

    abreModalAddBeneficiario();

    addBeneficiario();

    addMascaraCPFBeneficiario();

    excluirBeneficiarioDaGrid();

    $('#gridBeneficiarios').on('click', '.btnAlterarBeneficiario', function () {
        var idx = $(this).data('idx');
        var b = beneficiarios[idx];
        $('#BeneficiarioCPF').val(formatarCPF(b.cpf));
        $('#BeneficiarioNome').val(b.nome);
        beneficiarioEditando = idx;
    });
});

function abreModalAddBeneficiario() {
    $(document).on('click', '#btn-add-beneficiarios', function (e) {
        e.preventDefault();
        $('#modalBeneficiarios').modal('show');
    });
}

function addBeneficiario() {
    $(document)
        .off('click', '#btnIncluirBeneficiario') 
        .on('click', '#btnIncluirBeneficiario', function (e) {

            var cpf = removerMascaraCPF($('#BeneficiarioCPF').val());
            var nome = $('#BeneficiarioNome').val().trim();
            var cpfCliente = '';

            if ($('#CPF').length) {
                cpfCliente = removerMascaraCPF($('#CPF').val());
            }
            if (!validarCPF(cpf)) {
                ModalDialog("CPF do beneficiário Inválido", "Por favor, informe um CPF válido.");
                return;
            }
            if (!nome) {
                ModalDialog("Nome do beneficiário inválido", "Por favor, informe o nome do beneficiário.");
                return;
            }

            if (cpfCliente && cpf === cpfCliente) {
                ModalDialog("CPF do beneficiário Inválido", "O CPF do beneficiário não pode ser igual ao CPF do cliente!");
                return;
            }

            var indexDuplicado = beneficiarios.findIndex(function (b, index) {
                return b.cpf === cpf && (beneficiarioEditando === null || index !== beneficiarioEditando);
            });
            if (indexDuplicado !== -1) {
                ModalDialog("CPF do beneficiário Inválido", "Já existe um beneficiário com este CPF!");
                return;
            }
            if (beneficiarioEditando !== null) {
                beneficiarios[beneficiarioEditando] = { cpf: cpf, nome: nome };
                beneficiarioEditando = null;
            } else {
                adicionarBeneficiario(cpf, nome);
            }
            limparCamposBeneficiario();
            renderizarGridBeneficiarios();
        });
}

function addMascaraCPFBeneficiario() {

    $('#formBeneficiario #BeneficiarioCPF').on('input', function () {
        var cpf = $(this).val().replace(/\D/g, '');

        cpf = cpf.substring(0, 11);

        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
        cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

        $(this).val(cpf);
    });
}

function renderizarGridBeneficiarios() {
    var $tbody = $('#gridBeneficiarios tbody');
    $tbody.empty();
    beneficiarios.forEach(function (b, idx) {
        var row = '<tr>' +
            '<td>' + formatarCPF(b.cpf) + '</td>' +
            '<td>' + b.nome
            + '</td>' +
            '<td>' +
            '<button type="button" class="btn btn-primary btn-xs btnAlterarBeneficiario" data-idx="' + idx + '">Alterar</button> ' +
            '<button type="button" class="btn btn-primary btn-xs btnExcluirBeneficiario" data-idx="' + idx + '">Excluir</button>' +
            '</td>' +
            '</tr>';
        $tbody.append(row);
    });
}

function formatarCPF(cpf) {
    cpf = cpf ? cpf.replace(/\D/g, '') : '';
    if (cpf.length === 11) {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
}

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

function adicionarBeneficiario(cpf, nome) {

    beneficiarios.push({
        cpf: cpf,
        nome: nome
    });
}

function validarCPF(cpf) {
    cpf = cpf ? cpf.replace(/\D/g, '') : '';
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    var soma = 0, resto;
    for (var i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (var i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
}

function removerMascaraCPF(cpf) {
    return cpf ? cpf.replace(/\D/g, '') : '';
}

function limparCamposBeneficiario() {
    $('#BeneficiarioCPF').val('');
    $('#BeneficiarioNome').val('');
    beneficiarioEditando = null;
}

function excluirBeneficiarioDaGrid() {
    var idxParaExcluir = null;
    $('#gridBeneficiarios').on('click', '.btnExcluirBeneficiario', function () {
        idxParaExcluir = $(this).data('idx');
        $('#modalConfirmaExclusaoBeneficiario').modal('show');
    });

    $('#btnConfirmaExclusaoBeneficiario').on('click', function () {
        if (idxParaExcluir !== null) {
            beneficiariosExcluidos.push(beneficiarios[idxParaExcluir]);
            beneficiarios.splice(idxParaExcluir, 1);
            renderizarGridBeneficiarios();
            idxParaExcluir = null;
            limparCamposBeneficiario();
        }
        $('#modalConfirmaExclusaoBeneficiario').modal('hide');
    });
}
