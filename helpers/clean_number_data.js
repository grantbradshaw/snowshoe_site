'use strict';

module.exports = function(data) {
  return Number(data.replace(/[^0-9.]/g, ''));
};