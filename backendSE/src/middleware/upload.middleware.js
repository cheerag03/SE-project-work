const multer = require('multer');
const storage = multer.memoryStorage(); // upload to memory then to S3 or disk
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }});
module.exports = upload;
