'use strict';

module.exports = {
  customValidators: {
    comparatorLowerThan: function(comparator, value) {
      return Number(comparator) < Number(value);
    }
  }
};