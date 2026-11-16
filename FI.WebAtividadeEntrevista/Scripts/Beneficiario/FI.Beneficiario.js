var beneficiarios = [];
var beneficiarioEditando = null;
var beneficiariosExistentes = [];
var beneficiariosExcluidos = [];

$(document).ready(function () {

    abreModalAddBeneficiario();

    addBeneficiario();

    addMascaraCPFBeneficiario();

    excluirBeneficiarioDaGrid();

    SetarNosCamposBeneficiariosParaAlterar();

});

function SetarNosCamposBeneficiariosParaAlterar() {
    $('#gridBeneficiarios').on('click', '.btnAlterarBeneficiario', function () {
        var index = $(this).data('idx');
        var b = beneficiarios[index];
        $('#BeneficiarioCPF').val(formatarCPF(b.cpf));
        $('#BeneficiarioNome').val(b.nome);
        beneficiarioEditando = index;
    });
}

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
                ModalDialog("CPF do beneficiario Invalido", "Por favor, informe um CPF valido.");
                return;
            }
            if (!nome) {
                ModalDialog("Nome do beneficiário Invalido", "Por favor, informe o nome do beneficiario.");
                return;
            }

            if (cpfCliente && cpf === cpfCliente) {
                ModalDialog("CPF do beneficiario Invalido", "O CPF do beneficiario não pode ser igual ao CPF do cliente!");
                $('#BeneficiarioCPF').val('');
                return;
            }

            var indexDuplicado = beneficiarios.findIndex(function (b, index) {
                return b.cpf === cpf && (beneficiarioEditando === null || index !== beneficiarioEditando);
            });
            if (indexDuplicado !== -1) {
                ModalDialog("CPF do beneficiario Invalido", "Já existe um beneficiario com este CPF!");
                $('#BeneficiarioCPF').val('');
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

function adicionarBeneficiario(cpf, nome) {

    beneficiarios.push({
        cpf: cpf,
        nome: nome
    });
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
