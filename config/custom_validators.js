module.exports = {
  customValidators: {
    comparatorLowerThan: function(value, lowestPrice) {
      return Number(value) < Number(lowestPrice);
    }
  }
}