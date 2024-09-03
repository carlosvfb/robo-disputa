const puppeteer = require('puppeteer');

// Função para gerar um valor aleatório superior ao valor fornecido, mas não superior ao valor máximo
function getRandomHigherValue(baseValue, maxValue) {
    const numberValue = parseFloat(baseValue.replace('R$ ', '').replace('.', '').replace(',', '.'));
    const numberMaxValue = parseFloat(maxValue.replace('R$ ', '').replace('.', '').replace(',', '.'));
    const randomIncrease = (Math.random() * 0.1 + 0.01) * numberValue;
    const newValue = numberValue + randomIncrease;
    return (newValue > numberMaxValue ? numberMaxValue : newValue).toFixed(2).replace('.', ',');
}

// Função para extrair o valor mais recente da tabela
async function getHighestBidValue(page) {
    return page.evaluate(() => {
        const tabela = document.querySelector('#tb_lances');
        if (!tabela) return null;
        const linhas = tabela.querySelectorAll('tr');
        if (linhas.length === 0) return null;
        const valorMaisRecente = linhas[0].querySelectorAll('td')[3].innerText; // Pega o valor da primeira linha e quarta coluna
        return valorMaisRecente;
    });
}

// Função para esperar um tempo específico
async function waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para registrar o lance
async function registerBid(page, value) {
    // Define o valor no campo de input
    await page.click('#lance', { clickCount: 3 }); // Seleciona o texto atual
    await page.type('#lance', value);

    // Clica no botão para registrar o lance
    await page.click('#btn_lance');

    // Aguarda o modal de confirmação aparecer
    await waitFor(2000); // Tempo adicional para o modal carregar
    const confirmButtonSelector = 'button.swal2-confirm';
    try {
        await page.waitForSelector(confirmButtonSelector, { timeout: 60000 }); // Aguarda o botão de confirmação aparecer, com timeout de 60 segundos
        await page.click(confirmButtonSelector); // Clica no botão de confirmação
    } catch (error) {
        console.error('Modal de confirmação não apareceu a tempo.');
    }
}

(async () => {
    // Inicia o navegador
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Navega até a página desejada
    await page.goto('https://leiloariasmart.com.br/simulador3#');

    // Coloque o seu lance inicial
    const valorInicial = '600.000,00'; // Substitua pelo valor inicial que você deseja
    await page.type('#lance', valorInicial);

    // Clica no botão para registrar o lance
    await page.click('#btn_lance');

    // Aguarda o modal de confirmação aparecer
    await waitFor(2000); // Tempo adicional para o modal carregar
    const confirmButtonSelector = 'button.swal2-confirm';
    try {
        await page.waitForSelector(confirmButtonSelector, { timeout: 60000 }); // Aguarda o botão de confirmação aparecer, com timeout de 60 segundos
        await page.click(confirmButtonSelector); // Clica no botão de confirmação
    } catch (error) {
        console.error('Modal de confirmação não apareceu a tempo.');
    }

    const valorMaximo = '800.000,00'; // Defina o valor máximo

    // Monitora o cronômetro e registra o lance conforme necessário
    setInterval(async () => {
        try {
            // Pega o tempo restante do cronômetro
            const tempoRestante = await page.evaluate(() => {
                const cronometro = document.querySelector('#row-relogio');
                if (!cronometro) return null;

                const minutos = parseInt(cronometro.querySelector('#minuto').innerText);
                const segundos = parseInt(cronometro.querySelector('#segundo').innerText);
                return minutos * 60 + segundos;
            });

            if (tempoRestante !== null) {
                // Se o tempo restante for 1 minuto ou menos
                if (tempoRestante <= 60) {
                    const valorPadrao = '700.000,00'; // Substitua pelo valor padrão desejado

                    const valorAtual = await getHighestBidValue(page);
                    if (valorAtual) {
                        const valorPadraoNum = parseFloat(valorPadrao.replace('R$ ', '').replace('.', '').replace(',', '.'));
                        const valorAtualNum = parseFloat(valorAtual.replace('R$ ', '').replace('.', '').replace(',', '.'));

                        // Usa o valor padrão se for menor que o valor atual e menor que o valor máximo
                        if (valorPadraoNum <= valorAtualNum && valorAtualNum < parseFloat(valorMaximo.replace('R$ ', '').replace('.', '').replace(',', '.'))) {
                            const valorNovo = getRandomHigherValue(valorAtual, valorMaximo);
                            console.log(`Valor predefinido inferior. Novo valor: R$ ${valorNovo}`);
                            await registerBid(page, valorNovo);
                        } else if (valorAtualNum >= parseFloat(valorMaximo.replace('R$ ', '').replace('.', '').replace(',', '.'))) {
                            console.log(`Valor máximo alcançado: R$ ${valorMaximo}. Nenhum lance adicional.`);
                        } else {
                            console.log(`Valor predefinido: R$ ${valorPadrao}`);
                            await registerBid(page, valorPadrao);
                        }
                    } else {
                        console.log('Não foi possível obter o valor atual.');
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao verificar e registrar lance:', error);
        }
    }, 10000); // Verifica a cada 10 segundos
})();
