const puppeteer = require('puppeteer');

// Constantes para os seletores e valores
const SELECTOR_BTN_RESUME = '#btn-resume';
const SELECTOR_BTN_PAUSE = '#btn-pause';
const SELECTOR_TIMER = '#pnl-time';
const SELECTOR_TIME_LABEL = '#lbl-time';
const TARGET_TIME = '01:00'; // Tempo alvo para pausar o cronômetro
const CHECK_INTERVAL_MS = 100; // Intervalo de verificação em milissegundos

// Função para aguardar um tempo específico
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  // Inicia o navegador
  const browser = await puppeteer.launch({ headless: false }); // headless: false permite ver o navegador em ação
  const page = await browser.newPage();

  // Navega para a página desejada
  await page.goto('https://relogioonline.com.br/cronometro/', { timeout: 60000 });

  // Clica no botão de iniciar o cronômetro
  await page.click(SELECTOR_BTN_RESUME);
  console.log("O botão foi clicado");

  // Espera o cronômetro estar presente e visível na página
  console.log('Esperando o cronômetro ficar visível...');
  await page.waitForSelector(SELECTOR_TIMER, { visible: true });
  console.log('Cronômetro visível. Iniciando monitoramento...');

  // Função para verificar o tempo do cronômetro
  const checkTimer = async () => {
    const timeText = await page.evaluate((selector) => {
      const timerElement = document.querySelector(selector);
      return timerElement ? timerElement.textContent.trim() : null;
    }, SELECTOR_TIME_LABEL);
    return timeText;
  };

  // Função para pausar o cronômetro
  const pauseTimer = async () => {
    try {
      await page.click(SELECTOR_BTN_PAUSE);
      console.log('Cronômetro pausado com sucesso!');
    } catch (error) {
      console.error('Erro ao tentar pausar o cronômetro:', error);
      console.log('Tentando forçar o clique via JavaScript...');
      await page.evaluate((selector) => document.querySelector(selector).click(), SELECTOR_BTN_PAUSE);
    }
  };

  // Monitoramento do cronômetro
  while (true) {
    const timeText = await checkTimer();
    if (timeText) {
      console.log('Tempo atual do cronômetro:', timeText);

      // Exemplo adicional de ação para um tempo específico
      if (timeText === '00:30') {
        console.log("O resultado da conta é: " + 123 * 7);
      }

      // Verifica se o cronômetro está em 1:00 exatamente
      if (timeText === TARGET_TIME) {
        console.log('Cronômetro está em 1 minuto. Pausando...');
        await pauseTimer();
        break;
      }
    }
    
    // Aguarda antes de verificar novamente
    await wait(CHECK_INTERVAL_MS);
  }
})();
