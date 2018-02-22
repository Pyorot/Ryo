// Prototype-extending date utilities
Date.prototype.hhmmssmmm = function() {return this.toTimeString().slice(0,8) + '.' + this.getMilliseconds()}
   Date.prototype.hhmmss = function() {return this.toTimeString().slice(0,8)}
     Date.prototype.mmss = function() {return this.toTimeString().slice(3,8)}
       Date.prototype.ss = function() {return this.toTimeString().slice(6,8)}
 Date.prototype.yyyymmdd = function() {return this.toJSON().slice(0,10)}
     Date.prototype.mmdd = function() {return this.toJSON().slice(5,10)}

Date.prototype.number = function() {return this.getTime()/1000}
Number.prototype.date = function() {return new Date(this*1000)}