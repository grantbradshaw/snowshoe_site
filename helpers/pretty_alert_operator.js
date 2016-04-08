module.exports = function(operator) {
  var wordOperator;
  switch(operator) {
    case '<':
      wordOperator = 'less than';
      break;
    case '>':
      wordOperator = 'greater than';
      break;
    default:
      wordOperator = 'unknown';
  }
  return wordOperator;
}
