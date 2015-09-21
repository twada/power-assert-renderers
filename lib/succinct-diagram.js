'use strict';

var DiagramRenderer = require('power-assert-formatter').renderers.DiagramRenderer;
var inherits = require('util').inherits;
var forEach = require('array-foreach');

function SuccinctRenderer (config) {
    DiagramRenderer.call(this, config);
}
inherits(SuccinctRenderer, DiagramRenderer);

SuccinctRenderer.prototype.init = function (traversal) {
    var _this = this;
    traversal.on('start', function (context) {
        _this.context = context;
        _this.assertionLine = context.source.content;
        _this.initializeRows();
    });
    traversal.on('esnode', function (esNode) {
        if (!esNode.isCaptured()) {
            return;
        }
        if (isRoot(esNode)) {
            switch(esNode.currentNode.type) {
            case 'Identifier':
            case 'MemberExpression':
            case 'CallExpression':
                _this.events.push({value: esNode.value(), loc: esNode.location()});
                break;
            }
            return;
        }
        var parentEsNode = esNode.getParent();
        if (isRoot(parentEsNode)) {
            if (parentEsNode.currentNode.type === 'BinaryExpression') {
                _this.events.push({value: esNode.value(), loc: esNode.location()});
            }
        }
    });
    traversal.on('render', function (writer) {
        _this.events.sort(rightToLeft);
        _this.constructRows(_this.events);
        forEach(_this.rows, function (columns) {
            writer.write(columns.join(''));
        });
    });
};

function isRoot (esNode) {
    return esNode && !esNode.getParent();
}

function rightToLeft (a, b) {
    return b.loc.start.column - a.loc.start.column;
}

module.exports = SuccinctRenderer;
