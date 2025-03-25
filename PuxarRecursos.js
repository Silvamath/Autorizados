// ==UserScript==
// @name         AutoSendRecursos 3
// @version      1.0
// @description  Automatiza o envio de recursos em Tribal Wars
// @author       Silva.s
// @include      https://*/game.php*?village=*&screen=overview_villages&mode=prod*
// @include      https://*/game.php*?t=*&village=*&screen=overview_villages&mode=prod*
// @include      https://*/game.php*?village=*&screen=overview_villages&mode=prod&group=*
// @include      https://*/game.php*?t=*&village=*&screen=overview_villages&mode=prod&group=*
// @grant        none
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tribalwars.com.br
// ==/UserScript==

document.title = "Enviando Recursos 🔄";

(function() {
    'use strict';

    function loadSettings() {
        return JSON.parse(localStorage.getItem('envio_tribalwars_settings')) || {};
    }

    function saveSettings(settings) {
        localStorage.setItem('envio_tribalwars_settings', JSON.stringify(settings));
    }

    function abrirScriptShinko() {
        const script = document.createElement('script');
        script.src = 'https://shinko-to-kuma.com/scripts/res-senderV2.js';
        document.body.appendChild(script);
        console.log("Script Shinko aberto...");
    }

    function lidarComAlerta() {
        window.alert = function(message) {
            console.log("Alerta interceptado:", message);
            setTimeout(() => {
                window.location.reload(); // Atualizar a página após o alerta
            }, 1000);
        };
    }

    function verificarAlertaConfirmacao(callback) {
        const intervaloChecarAlerta = setInterval(() => {
            const alertaConfirmacao = document.querySelector('.vis.confirm');
            if (alertaConfirmacao) {
                clearInterval(intervaloChecarAlerta);
                const botaoOK = alertaConfirmacao.querySelector('input[type="submit"]');
                if (botaoOK) {
                    botaoOK.click();
                    console.log("Clique no botão OK no alerta de confirmação.");
                    setTimeout(() => {
                        window.location.reload(); // Atualizar a página após clicar em OK
                    }, 1000);
                } else {
                    console.error("Botão OK não encontrado no alerta de confirmação.");
                }
                if (callback) callback();
            }
        }, 1000); // Verificar a cada 1 segundo se há alerta de confirmação
    }

    function verificarSucesso() {
        const sucesso = document.querySelector('#ds_body > div.autoHideBox.success');
        return sucesso !== null;
    }

    // Função para enviar recursos com intervalo entre os cliques
    function enviarRecursos(intervaloCliques) {
        // Selecionar todos os botões de envio de recursos pela classe
        const elementosEnviarRecursos = document.querySelectorAll('input[type="button"].btn.evt-confirm-btn.btn-confirm-yes');

        if (elementosEnviarRecursos.length === 0) {
            console.log("Nenhum botão de envio de recursos encontrado.");
            return;
        }

        let indice = 0;

        // Função recursiva que clica nos botões com intervalo
        function clicarBotao() {
            // Se todos os botões foram clicados, terminar
            if (indice >= elementosEnviarRecursos.length) {
                console.log("Todos os botões foram clicados.");
                setTimeout(() => {
                    verificarAlertaConfirmacao(() => {
                        // Após verificar alertas, continuar clicando nos botões restantes
                        if (verificarOpcoesClique()) {
                            enviarRecursos(intervaloCliques);
                        }
                    });
                }, 1000);
                return;
            }

            // Pega o botão atual que será clicado
            const botaoAtual = elementosEnviarRecursos[indice];

            // Verificar se o botão está desabilitado
            if (botaoAtual.disabled) {
                console.log("Botão desativado, aguardando reativação...");
                setTimeout(clicarBotao, 1000);
                return;
            }

            // Tenta clicar no botão
            try {
                botaoAtual.click();
                console.log(`Clique no botão ${indice + 1}.`);
                indice++; // Avança para o próximo botão
                setTimeout(clicarBotao, intervaloCliques); // Aguarda o intervalo entre os cliques
            } catch (error) {
                console.error("Erro ao clicar no botão:", error);
            }
        }

        clicarBotao(); // Iniciar o processo de clique
    }

    // Função que verifica se há novas opções para continuar clicando após o alerta
    function verificarOpcoesClique() {
        // Verifica se existem mais opções de clique
        const opcoes = document.querySelectorAll('.ui-dialog-buttonset button.ui-button');
        return opcoes.length > 0; // Se houver novas opções, retorna true
    }

    // Função principal para iniciar o envio de recursos
    function iniciarEnvioDeRecursos() {
        const intervalo = 2000; // Intervalo de 2 segundos entre os cliques
        enviarRecursos(intervalo); // Inicia o processo de clicar nos botões
    }

    // Chama a função principal para começar o processo
    iniciarEnvioDeRecursos();

    function atualizarUltimaExecucao() {
        const dataHoraAtual = new Date().toLocaleString();
        localStorage.setItem('ultimaExecucao', dataHoraAtual);
        const ultimaExecucaoElement = document.getElementById('ultimaExecucao');
        if (ultimaExecucaoElement) {
            ultimaExecucaoElement.textContent = dataHoraAtual;
        }
    }

function automatizar(intervaloMinutos, intervaloCliques) {
    // Função para selecionar um grupo específico
    function selectGroup(groupId) {
        const groupLink = document.querySelector(`a.group-menu-item[data-group-id="${groupId}"]`);
        if (groupLink) {
            groupLink.click();
            console.log(`Grupo com ID ${groupId} selecionado.`);
        } else {
            console.log(`Grupo com ID ${groupId} não encontrado!`);
        }
    }

    // Função para selecionar todos os grupos
    function selectAllGroups() {
        const allGroupsLink = document.querySelector('a.group-menu-item[data-group-id="0"]');
        if (allGroupsLink) {
            allGroupsLink.click();
            console.log('Grupo "Todos" selecionado.');
        } else {
            console.log('Link para "todos" não encontrado!');
        }
    }

    // Função para garantir que a tabela e os elementos sejam carregados
    function esperarElementoCarregar() {
        return new Promise((resolve) => {
            const checkExist = setInterval(() => {
                const tabela = document.querySelector('#overview_menu table.vis');
                if (tabela) {
                    clearInterval(checkExist);
                    console.log("Tabela carregada!");
                    resolve();
                }
            }, 500); // Verifica a cada 500ms
        });
    }

    // Função para iniciar a execução após a tabela carregar
    async function iniciarExecucao() {
        // Primeiro, aguarda a tabela ser carregada
        await esperarElementoCarregar();

        // Agora, seleciona o grupo (salvo ou "Todos")
        const groupId = localStorage.getItem('selectedGroupId') || 0; // Pega o grupo salvo ou "Todos" se não houver
        selectGroup(groupId);

        // Espera um pouco para garantir que a navegação do grupo foi concluída
        setTimeout(() => {
            // Agora, inicia o script externo
            abrirScriptShinko();

            // Configurar tratamento de alertas
            lidarComAlerta();

            // Aguarda um pequeno tempo para garantir que o script externo tenha sido carregado
            setTimeout(() => {
                // Preenche o campo de coordenada com o valor salvo e clica no botão "Salvar"
                const coordenada = localStorage.getItem('coordenada'); // Obtém a coordenada salva

                const coordinateField = document.getElementById('coordinateTargetFirstTime');
                if (coordinateField && coordenada) {
                    coordinateField.value = coordenada;
                    console.log(`Coordenada preenchida: ${coordenada}`);

                    const saveButton = document.getElementById('saveCoord');
                    if (saveButton) {
                        saveButton.click();
                        console.log("Botão 'Salvar' clicado.");
                    } else {
                        console.log("Botão 'Salvar' não encontrado.");
                    }
                } else {
                    console.log("Coordenada ou campo de coordenada não encontrados.");
                }

                // Inicia a automação após o intervalo inicial
                setTimeout(() => {
                    if (document.getElementById('automatizar').checked) {
                        // Se a opção de automatizar estiver marcada
                        enviarRecursos(intervaloCliques); // Inicia o envio dos recursos
                        atualizarUltimaExecucao(); // Atualiza a última execução
                        setInterval(() => {
                            window.location.reload(); // Atualiza a página periodicamente após o intervalo de minutos
                        }, intervaloMinutos * 60 * 1000); // Espera o intervalo de minutos configurado
                    }
                }, intervaloCliques); // Espera o intervalo entre os cliques

            }, 2000); // Espera 2 segundos após o carregamento do script para preencher e clicar no botão
        }, 2000); // Espera 2 segundos para garantir que a navegação do grupo tenha sido completada

    }

    // Chama a função para iniciar a execução
    iniciarExecucao();
}


    function addAutomaticBalanceTable(settings) {
    const overviewMenuTable = document.getElementById('overview_menu');
    if (!overviewMenuTable) return;

    const existingTable = document.querySelector('#overview_menu table.vis');
    if (existingTable) {
        existingTable.remove();
    }

    const coordenada = localStorage.getItem('coordenada'); // Obter a coordenada salva aqui

    const newTableRow = document.createElement('tr');
    newTableRow.innerHTML = `
        <td colspan="2">
            <table class="vis" style="width:100%;">
                <thead>
                    <tr>
                        <th colspan="2">Envio Automático 🔄</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><label for="automatizar"><span class="icon header settings"></span> Automatizar:</label></td>
                        <td><input type="checkbox" id="automatizar" ${settings.automatizar ? 'checked' : ''}></td>
                    </tr>
                    <tr>
                        <td><span class="icon header time" title="Intervalo para enviar"></span> Intervalo para enviar (min):</td>
                        <td><input type="number" id="intervaloMinutos" value="${settings.intervaloMinutos || 5}"></td>
                    </tr>
                    <tr>
                        <td><span class="icon header time" title="Intervalo entre cliques"></span> Intervalo entre cliques (ms):</td>
                        <td><input type="number" id="intervaloCliques" value="${settings.intervaloCliques || 333}"></td>
                    </tr>
                    <tr style="height: 0;">
                        <td><img id='img_sent' src='https://dsbr.innogamescdn.com/asset/69990994/graphic/welcome/player_villages.png'/> <label for="coordenada">Coordenada:</label></td>
                        <td><input type="text" id="coordenada" placeholder=" Digite as coordenadas" value="${coordenada || ''}"></td>
                    </tr>
                    <tr>
                        <td><span class="icon header ressources"></span> <title="Defina o grupo para requisitar"> <b>Grupo:</b></td>
                        <td><span id="groupSelectorContainer"></span></td>
                    </tr>
                    <tr>
                        <td colspan="2"><button id="configurarBtn">Configurar</button><button id="enviarBtn">Enviar</button></td>
                    </tr>
                    <tr>
                        <td colspan="2"><div id="externalScriptContainer"></div></td>
                    </tr>
                    <tr>
                        <td colspan="2">Última execução: <span id="ultimaExecucao">${localStorage.getItem('ultimaExecucao') || 'N/A'}</span></td>
                    </tr>
                </tbody>
            </table>
        </td>
    `;
    overviewMenuTable.appendChild(newTableRow);

    // Agora adicionamos o event listener para o campo de coordenada
    const coordenadaField = document.getElementById('coordenada');
    if (coordenadaField) {
        coordenadaField.addEventListener('input', (event) => {
            localStorage.setItem('coordenada', event.target.value); // Salva o valor modificado
        });
    }

        const automatizarCheckbox = document.getElementById('automatizar');
        const intervaloMinutosInput = document.getElementById('intervaloMinutos');
        const intervaloCliquesInput = document.getElementById('intervaloCliques');
        const configurarBtn = document.getElementById('configurarBtn');
        const enviarBtn = document.getElementById('enviarBtn');

        // Group selector setup
        function loadGroups() {
            fetch('/game.php?village=id&screen=groups&mode=overview&ajax=load_group_menu')
                .then(response => response.json())
                .then(data => {
                    const groups = data.result;
                    const groupSelectorContainer = document.getElementById('groupSelectorContainer');
                    let groupSelectorHTML = '<select id="groupSelector"><option value="">Selecione um grupo</option>';
                    groups.forEach(group => {
                        groupSelectorHTML += `<option value="${group.group_id}">${group.name}</option>`;
                    });
                    groupSelectorHTML += '</select>';
                    groupSelectorContainer.innerHTML = groupSelectorHTML;

                    // Carregar grupo salvo, se houver
                    const savedGroupId = localStorage.getItem('selectedGroupId');
                    if (savedGroupId) {
                        const groupSelector = document.getElementById('groupSelector');
                        groupSelector.value = savedGroupId; // Seleciona automaticamente
                    }

                    document.getElementById("groupSelector").addEventListener("change", (e) => {
                        const selectedGroupId = e.target.value;
                        localStorage.setItem('selectedGroupId', selectedGroupId); // Salvar a seleção
                    });
                })
                .catch(error => console.error('Erro ao carregar grupos:', error));
        }

        loadGroups();

        // Save configurations
        function saveConfigurations() {
            const settings = {
                automatizar: automatizarCheckbox.checked,
                intervaloMinutos: intervaloMinutosInput.value,
                intervaloCliques: intervaloCliquesInput.value
            };
            saveSettings(settings);
            if (automatizarCheckbox.checked) {
                const intervaloMinutos = intervaloMinutosInput.value || 5;
                const intervaloCliques = intervaloCliquesInput.value || 333;
                setTimeout(() => automatizar(intervaloMinutos, intervaloCliques), intervaloMinutos * 60 * 1000);
            }
        }

        automatizarCheckbox.addEventListener('change', saveConfigurations);
        intervaloMinutosInput.addEventListener('change', saveConfigurations);
        intervaloCliquesInput.addEventListener('change', saveConfigurations);

        configurarBtn.addEventListener('click', abrirScriptShinko);

        function enviar() {
            const intervaloCliques = intervaloCliquesInput.value || 333;
            enviarRecursos(intervaloCliques);
            atualizarUltimaExecucao();
        }

        enviarBtn.addEventListener('click', enviar);

        // Se a opção de automatizar estiver marcada, configure a automatização com os valores atuais
        if (automatizarCheckbox.checked) {
            const intervaloMinutos = intervaloMinutosInput.value || 5;
            const intervaloCliques = intervaloCliquesInput.value || 333;
            setTimeout(() => automatizar(intervaloMinutos, intervaloCliques), intervaloMinutos * 60 * 1000);
        }
    }

    // Carregar as configurações iniciais
    const settings = loadSettings();
    addAutomaticBalanceTable(settings);

})();
