const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const program = new Command();

// Налаштовуємо програму
program
  .name('weather-app')
  .description('CLI tool for working with weather data')
  .version('1.0.0')
  .option('-i, --input <path>', 'input file path (JSON with weather data)')
  .option('-o, --output <path>', 'output file path')
  .option('-d, --display', 'display result in console');

// Парсимо аргументи
program.parse();

// Отримуємо опції
const options = program.opts();

// Власна перевірка обов'язкового параметра (за вимогами завдання)
if (!options.input) {
  console.error('Please, specify input file');
  process.exit(1);
}

// Функція для читання та обробки даних
function processWeatherData() {
  try {
    // Перевірка чи файл існує
    if (!fs.existsSync(options.input)) {
      console.error('Cannot find input file');
      process.exit(1);
    }

    // Читання JSON файлу
    const rawData = fs.readFileSync(options.input, 'utf8');
    const weatherData = JSON.parse(rawData);

    // Базова обробка даних
    const result = {
      message: 'Weather data processed successfully',
      recordsCount: weatherData.length,
      stations: [...new Set(weatherData.map(item => item.station_name))],
      data: weatherData
    };

    const resultString = JSON.stringify(result, null, 2);

    // Вивід у консоль якщо задано -d
    if (options.display) {
      console.log('=== WEATHER DATA RESULT ===');
      console.log(resultString);
    }

    // Запис у файл якщо задано -o
    if (options.output) {
      fs.writeFileSync(options.output, resultString);
      console.log(`Result saved to: ${options.output}`);
    }

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('Cannot find input file');
    } else if (error instanceof SyntaxError) {
      console.error('Invalid JSON format in input file');
    } else {
      console.error('Error processing file:', error.message);
    }
    process.exit(1);
  }
}

// Запускаємо обробку
processWeatherData();