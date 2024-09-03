const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://www.calculadoraonline.com.br/basica'); // Substitua pela URL real

  // Função para executar a ação principal e a de backup
  const executarAcoes = async () => {
    let timerValue = '';

    while (timerValue !== '00:00:01') {
      timerValue = await page.evaluate(() => {
        const timerElement = document.querySelector('#timer'); // Substitua pelo seletor real
        return timerElement ? timerElement.textContent.trim() : '';
      });

      console.log('Valor do Timer:', timerValue);

      // Ação de backup: Executa um pouco antes do momento crítico (ajuste conforme necessário)
      if (timerValue === '00:00:03') {
        console.log('Executando ação de backup...');
        await page.click('#botaoFinalBackup'); // Substitua pelo seletor real da ação de backup
      }

      await page.waitForTimeout(50); // Ajuste conforme necessário
    }

    // Ação principal no último milissegundo
    console.log('O timer chegou a 00:00:01, executando ação principal...');
    await page.click('#botaoFinal'); // Substitua pelo seletor real da ação principal
  };

  // Começar a monitorar o timer e executar as ações
  await executarAcoes();

  await browser.close();
})();
