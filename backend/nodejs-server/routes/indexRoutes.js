var express = require('express');
const path = require('path');
var router = express.Router();

/* GET home page. */
// Root route handler
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
module.exports = router;
