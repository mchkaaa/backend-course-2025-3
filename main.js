const { Command } = require('commander');
const fs = require('fs');

const program = new Command();

// Налаштовуємо програму з усіма параметрами
program
  .name('weather-app')
  .description('CLI tool for working with historical weather data')
  .version('1.0.0')
  .requiredOption('-i, --input <path>', 'input JSON file with weather data')
  .option('-o, --output <path>', 'output file path')
  .option('-d, --display', 'display result in console')
  .option('-h, --humidity', 'display humidity at 3pm (Humidity3pm field)')
  .option('-r, --rainfall <mm>', 'filter records with rainfall greater than specified value (Rainfall field)', parseFloat);

// Обробка командного рядка
try {
  program.parse();
} catch (err) {
  console.error('Please, specify input file');
  process.exit(1);
}

const options = program.opts();

// Функція для обробки погодних даних
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

    // Фільтрація даних за кількістю опадів (якщо задано параметр -r)
    let filteredData = weatherData;
    if (options.rainfall !== undefined) {
      filteredData = weatherData.filter(record => {
        // Перевірка наявності поля Rainfall та його значення
        const rainfall = record.Rainfall !== undefined ? record.Rainfall : record.rainfall;
        return rainfall > options.rainfall;
      });
    }

    // Форматування результату для виводу
    let resultLines = [];
    
    if (options.humidity) {
      // Вивід з вологістю: Rainfall Pressure3pm Humidity3pm
      resultLines = filteredData.map(record => {
        const rainfall = record.Rainfall !== undefined ? record.Rainfall : record.rainfall || 0;
        const pressure = record.Pressure3pm !== undefined ? record.Pressure3pm : record.pressure3pm || 0;
        const humidity = record.Humidity3pm !== undefined ? record.Humidity3pm : record.humidity3pm || 0;
        
        return `${rainfall} ${pressure} ${humidity}`;
      });
    } else {
      // Вивід без вологості: Rainfall Pressure3pm
      resultLines = filteredData.map(record => {
        const rainfall = record.Rainfall !== undefined ? record.Rainfall : record.rainfall || 0;
        const pressure = record.Pressure3pm !== undefined ? record.Pressure3pm : record.pressure3pm || 0;
        
        return `${rainfall} ${pressure}`;
      });
    }

    const resultString = resultLines.join('\n');

    // Вивід у консоль якщо задано -d
    if (options.display) {
      console.log('=== WEATHER DATA RESULT ===');
      if (options.humidity) {
        console.log('Rainfall Pressure3pm Humidity3pm');
      } else {
        console.log('Rainfall Pressure3pm');
      }
      console.log('---------------------------');
      console.log(resultString);
    }

    // Запис у файл якщо задано -o
    if (options.output) {
      let outputContent = resultString;
      if (options.display) {
        // Додаємо заголовки для файлу
        if (options.humidity) {
          outputContent = 'Rainfall Pressure3pm Humidity3pm\n' + outputContent;
        } else {
          outputContent = 'Rainfall Pressure3pm\n' + outputContent;
        }
      }
      fs.writeFileSync(options.output, outputContent);
      if (options.display) {
        console.log(`\nResult saved to: ${options.output}`);
      }
    }

    // Статистика (тільки для консолі)
    if (options.display) {
      console.log(`\nRecords processed: ${filteredData.length}`);
      if (options.rainfall !== undefined) {
        console.log(`Filtered by rainfall > ${options.rainfall}mm`);
      }
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