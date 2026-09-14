// Configuracao do Karma.
//
// Deliberadamente minima: o builder @angular/build:karma injeta o framework,
// os plugins e os reporters. O que precisamos declarar aqui e o launcher
// ChromeHeadlessNoSandbox — em container (CI incluso) o Chrome roda como
// root e sem --no-sandbox o navegador nao sobe, deixando a suite sem executar.
module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    plugins: [require('karma-jasmine'), require('karma-chrome-launcher')],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      },
    },
    browsers: ['ChromeHeadlessNoSandbox'],
    restartOnFileChange: true,
  });
};
