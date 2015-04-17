const assert = require('assert');
// const _ = require('lodash');
const Riccardo = require('riccardo');
var riccardo = new Riccardo();
riccardo.scan('../lib', '');

describe('windowedBlockDevice', function () {
  const WindowedBlockDevice = riccardo.get('windowedBlockDevice');

  it('컴포넌트가 있어야 합니다.', function () {
    assert(WindowedBlockDevice);
  });
});