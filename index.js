// Підключаємо бібліотеку commander
const { Command } = require('commander');

// Створюємо новий об'єкт програми
const program = new Command();

// Налаштовуємо нашу програму
program
  .name('weather-app') // Назва програми
  .description('CLI tool for working with weather data') // Опис
  .version('1.0.0'); // Версія

// Додаємо команду 'show', яка буде виводити повідомлення
program
  .command('show')
  .description('Show weather data')
  .action(() => {
    console.log('Command "show" was executed. Weather data would be displayed here.');
  });

// Додаємо команду 'process', яка приймає аргумент <file>
program
  .command('process <file>')
  .description('Process a specific weather data file')
  .action((file) => {
    console.log(`Command "process" was executed with file: ${file}`);
  });

// Парсимо аргументи командного рядка
program.parse();

// Додатковий вивід, щоб побачити аргументи (для наочності)
console.log('Arguments from command line:', process.argv);