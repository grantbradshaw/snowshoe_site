'use strict';

module.exports = function shorten(str, limit){
  if (str.length >= limit) {str = str.substring(0,limit) + '...';}
  return str;
};