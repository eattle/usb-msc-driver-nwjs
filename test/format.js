const assert = require('assert');
const Riccardo = require('riccardo');
var riccardo = new Riccardo();
riccardo.scan('../lib', '');

describe('format', function () {
  const format = riccardo.get('format');
  it('모듈이 있어야 합니다.', function () {
    assert(format);
  });
  describe('마스터 부트 레코드', function () {
    const MemoryBlockDevice = riccardo.get('memoryBlockDevice');
    var device = new MemoryBlockDevice({ size: 1000000000 });
    it('첫 번째 예약된 볼륨 크기가 잘못되었으면 예외를 던져야 합니다.', function () {
      format.formatMbr(new MemoryBlockDevice({ size: 42 }), 10, function () {});
      assert.throws(function () {
        format.formatMbr(new MemoryBlockDevice({ size: 42 }), 35, function () {});
      });
      assert.throws(function () {
        format.formatMbr(new MemoryBlockDevice({ size: 42 }), 0, function () {});
      });
      assert.throws(function () {
        format.formatMbr(new MemoryBlockDevice({ size: 42 }), -1, function () {});
      });
    });
    describe('첫 번째 볼륨 크기 100000 블럭', function () {
      it('예외 또는 오류 없이 성공적으로 수행되어야 합니다.', function () {
        format.formatMbr(device, 100000, function (err) {
          assert.strictEqual(err, null);
          assert.strictEqual(Array.prototype.slice.call(arguments).length, 1);
        });
      });
      it('시그니처 0x55, 0xAA가 지정되어야 합니다.', function () {
        var buffer = new Buffer(512);
        device.readBlock(0, buffer, function (err, result) {
          assert.strictEqual(err, null);
          assert.strictEqual(result[510], 0x55);
          assert.strictEqual(result[511], 0xAA);
        });
      });
      describe('파티션 엔트리를 검사합니다.', function () {
        describe('첫 번째 예약된 파티션 엔트리', function () {
          var base = 446;
          it('상태가 0x00이어야 합니다.', function () {
            var buffer = new Buffer(512);
            device.readBlock(0, buffer, function (err, result) {
              assert.strictEqual(err, null);
              assert.strictEqual(result[base], 0x00);
            });
          });
          it('두 번 등장하는 CHS 필드는 0xfe, 0xff, 0xff이어야 합니다.', function () {
            var buffer = new Buffer(512);
            device.readBlock(0, buffer, function (err, result) {
              assert.strictEqual(err, null);
              assert.strictEqual(result[base + 1], 0xfe);
              assert.strictEqual(result[base + 2], 0xff);
              assert.strictEqual(result[base + 3], 0xff);
              assert.strictEqual(result[base + 5], 0xfe);
              assert.strictEqual(result[base + 6], 0xff);
              assert.strictEqual(result[base + 7], 0xff);
            });
          });
          it('시작 블럭 주소가 2이어야 합니다.', function () {
            var buffer = new Buffer(512);
            device.readBlock(0, buffer, function (err, result) {
              assert.strictEqual(err, null);
              assert.strictEqual(result[base + 8], 0x02);
              assert.strictEqual(result[base + 9], 0x00);
              assert.strictEqual(result[base + 10], 0x00);
              assert.strictEqual(result[base + 11], 0x00);
            });
          });
          it('크기가 100000 블럭이어야 합니다.', function () {
            var buffer = new Buffer(512);
            device.readBlock(0, buffer, function (err, result) {
              assert.strictEqual(err, null);
              assert.strictEqual(result[base + 12], 0xA0);
              assert.strictEqual(result[base + 13], 0x86);
              assert.strictEqual(result[base + 14], 0x01);
              assert.strictEqual(result[base + 15], 0x00);
            });
          });
        });
        describe('Eattle 파티션 엔트리', function () {
          var base = 462;
          it('상태가 0x00이어야 합니다.', function () {
            var buffer = new Buffer(512);
            device.readBlock(0, buffer, function (err, result) {
              assert.strictEqual(err, null);
              assert.strictEqual(result[base], 0x00);
            });
          });
          it('두 번 등장하는 CHS 필드는 0xfe, 0xff, 0xff이어야 합니다.', function () {
            var buffer = new Buffer(512);
            device.readBlock(0, buffer, function (err, result) {
              assert.strictEqual(err, null);
              assert.strictEqual(result[base + 1], 0xfe);
              assert.strictEqual(result[base + 2], 0xff);
              assert.strictEqual(result[base + 3], 0xff);
              assert.strictEqual(result[base + 5], 0xfe);
              assert.strictEqual(result[base + 6], 0xff);
              assert.strictEqual(result[base + 7], 0xff);
            });
          });
          it('시작 블럭 주소가 100002이어야 합니다.', function () {
            var buffer = new Buffer(512);
            device.readBlock(0, buffer, function (err, result) {
              assert.strictEqual(err, null);
              assert.strictEqual(result[base + 8], 0xA2);
              assert.strictEqual(result[base + 9], 0x86);
              assert.strictEqual(result[base + 10], 0x01);
              assert.strictEqual(result[base + 11], 0x00);
            });
          });
          it('크기가 999899998 블럭이어야 합니다.', function () {
            var buffer = new Buffer(512);
            device.readBlock(0, buffer, function (err, result) {
              assert.strictEqual(err, null);
              assert.strictEqual(result[base + 12], 0x5E);
              assert.strictEqual(result[base + 13], 0x43);
              assert.strictEqual(result[base + 14], 0x99);
              assert.strictEqual(result[base + 15], 0x3B);
            });
          });
        });
      });
    });
  });
});