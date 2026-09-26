const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const readmePath = path.join(__dirname, 'README.md');

if (!fs.existsSync(dataDir)) {
  console.log('Data directory not found!');
  process.exit(1);
}

const jsonFiles = fs.readdirSync(dataDir)
  .filter(f => f.endsWith('.json'))
  .sort((a, b) => b.localeCompare(a));

let tablesContent = [];

for (const file of jsonFiles) {
  const year = path.basename(file, '.json');
  const raw = fs.readFileSync(path.join(dataDir, file), 'utf8');
  const data = JSON.parse(raw);

  let lines = [
    `### 📅 ${year} Rail Network Distribution`,
    '',
    '| Country/Region | 🚂 Slow Trains <br>*(Local/Commuter/Conventional)* | 🚆 RRTS / Regional Express <br>*(Medium-Speed: 140–200 km/h)* | 🚄 Bullet Trains / High-Speed Rail <br>*(Dedicated: 250–350+ km/h)* |',
    '| :--- | :---: | :---: | :---: |'
  ];

  for (const row of data) {
    lines.push(`| ${row.country_region} | ${row.slow_trains} | ${row.medium_speed} | ${row.bullet_trains} |`);
  }

  tablesContent.push(lines.join('\n'));
}

const allTablesMd = tablesContent.join('\n\n');
let readmeText = fs.readFileSync(readmePath, 'utf8');

const startMarker = '<!-- DATA_TABLES_START -->';
const endMarker = '<!-- DATA_TABLES_END -->';

const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
const replacement = `${startMarker}\n\n${allTablesMd}\n\n${endMarker}`;

if (regex.test(readmeText)) {
  fs.writeFileSync(readmePath, readmeText.replace(regex, replacement));
  console.log('Successfully updated README.md via node script');
} else {
  console.log('Markers not found!');
}
