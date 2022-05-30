"use strict";

var util = require('util');
var Transform = require('stream').Transform;
var crypto = require('crypto');
var algorithm = require('./algorithm');

class Hash extends Transform {

	constructor(opts) {
		super(opts);
		this._sum = 1;
	}

	update(data, encoding) {
		if (this._done)
			throw new TypeError('HashUpdate fail');

		if (!(data instanceof Buffer)) {
			data = Buffer.from(data, encoding || 'utf8');
		}

		this._sum = algorithm.sum(data, this._sum);

		return this;
	}

	digest(encoding) {
		if (this._done)
			throw new Error('Not initialized');

		this._done = true;

		var buf = Buffer.allocUnsafe(4);
		buf.writeUInt32BE(this._sum, 0);

		if (!encoding || encoding === 'buffer')
			return buf;
		else
			return buf.toString(encoding);
	}

	_transform(chunk, encoding, callback) {
		this.update(chunk, encoding);
		callback();
	}

	_flush(callback) {
		var encoding = this._readableState.encoding || 'buffer';
		this.push(this.digest(encoding), encoding);
		callback();
	}

}

module.exports = Hash;