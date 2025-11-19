const originalLog = console.log;
console.log = () => {};
require('dotenv').config({ path: '.env.test' });
console.log = originalLog;
