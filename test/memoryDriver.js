const assert = require('assert');
const _ = require('lodash');
const Riccardo = require('riccardo');
var riccardo = new Riccardo();
riccardo.scan('../lib', '');

describe('memoryDriver', function () {

  const MemoryDriver = riccardo.get('memoryDriver');

  it('컴포넌트가 있어야 합니다.', function () {
    assert(MemoryDriver);
  });

  it('설정이 없으면 예외를 던져야 합니다.', function () {
    assert.throws(function () {
      new MemoryDriver();
    });
  });
  
  describe('크기 10', function () {    
    var memoryDriver = null;
    it('초기화 성공해야 합니다.', function () {
      var config = {
        size: 10
      };
      memoryDriver = new MemoryDriver(config);
    });

    it('getLastLogicalBlockAddress가 10을 반환해야 합니다.', function () {
      assert.strictEqual(memoryDriver.getLastLogicalBlockAddress(), 10);
    });
    it('getBlockLength가 512를 반환해야 합니다.', function () {
      assert.strictEqual(memoryDriver.getBlockLength(), 512);
    });

    describe('readBlock', function () {
      it('처음에 모든 블럭의 길이가 512이어야 합니다.', function (done) {
        var remaining = 10;
        var callback = function (err, result) {
          assert.strictEqual(err, null);
          assert.strictEqual(result.length, 512);
          if (--remaining === 0) {
            done();
          }
        };
        for (var i = 1; i <= 10; i++) {
          var buffer = new Buffer(512);
          memoryDriver.readBlock(i, buffer, callback);
        }
      });
      it('처음에 모든 블럭의 값이 0이어야 합니다.', function (done) {
        var remaining = 10;
        var callback = function (err, result) {
          assert.strictEqual(err, null);
          _.forEach(result, function (value) {
            assert.strictEqual(value, 0);
          });
          if (--remaining === 0) {
            done();
          }
        };
        for (var i = 1; i <= 10; i++) {
          var buffer = new Buffer(512);
          memoryDriver.readBlock(i, buffer, callback);
        }
      });
      it('읽을 때 범위를 벗어나면 예외를 던져야 합니다.', function (done) {
        assert.throws(function () {
          var buffer = new Buffer(512);
          memoryDriver.readBlock(-1, buffer, done);
        });
        assert.throws(function () {
          var buffer = new Buffer(512);
          memoryDriver.readBlock(11, buffer, done);
        });
        assert.throws(function () {
          var buffer = new Buffer(512);
          memoryDriver.readBlock(42, buffer, done);
        });
        done();
      });
      it('읽을 때 buffer가 없으면 예외를 던져야 합니다.', function (done) {
        assert.throws(function () {
          memoryDriver.readBlock(5, null, done);
        });
        done();
      });
      it('읽을 때 버퍼 크기가 512가 아니면 예외를 던져야 합니다.', function (done) {
        assert.throws(function () {
          var buffer = new Buffer(511);
          memoryDriver.readBlock(5, buffer, done);
        });
        assert.throws(function () {
          var buffer = new Buffer(513);
          memoryDriver.readBlock(5, buffer, done);
        });
        done();
      });
    });
    describe('writeBlock', function () {
      it('모든 블럭을 각 블럭 번호로 채웁니다.', function (done) {
        var remaining = 10;
        var callback = function (err) {
          assert.strictEqual(err, null);
          if (--remaining === 0) {
            done();
          }
        };
        for (var i = 1; i <= 10; i++) {
          var buffer = new Buffer(512);
          buffer.fill(i);
          memoryDriver.readBlock(i, buffer, callback);
        }
      });
      it('쓸 때 범위를 벗어나면 예외를 던져야 합니다.', function (done) {
        assert.throws(function () {
          var buffer = new Buffer(512);
          memoryDriver.writeBlock(-1, buffer, done);
        });
        assert.throws(function () {
          var buffer = new Buffer(512);
          memoryDriver.writeBlock(11, buffer, done);
        });
        assert.throws(function () {
          var buffer = new Buffer(512);
          memoryDriver.writeBlock(42, buffer, done);
        });
        done();
      });
      it('쓸 때 버퍼가 없으면 예외를 던져야 합니다.', function (done) {
        assert.throws(function () {
          memoryDriver.writeBlock(5, null, done);
        });
        done();
      });
      it('쓸 때 버퍼 크기가 512가 아니면 예외를 던져야 합니다.', function (done) {
        assert.throws(function () {
          var buffer = new Buffer(511);
          memoryDriver.writeBlock(5, buffer, done);
        });
        assert.throws(function () {
          var buffer = new Buffer(513);
          memoryDriver.writeBlock(5, buffer, done);
        });
        done();
      });
      it('모든 블럭을 각 블럭 번호로 채웁니다.', function (done) {
        var remaining = 10;
        var callback = function (err) {
          assert.strictEqual(err, null);
          if (--remaining === 0) {
            done();
          }
        };
        for (var i = 1; i <= 10; i++) {
          var buffer = new Buffer(512);
          buffer.fill(i);
          memoryDriver.writeBlock(i, buffer, callback);
        }
      });
    });
    describe('데이터 확인', function () {
      it('모든 블럭이 각 블럭 번호로 채워져 있어야 합니다.', function (done) {
        var remaining = 10;
        var callback = function (lba) {
          return function (err, result) {
            assert.strictEqual(err, null);
            for (var i = 0; i < 512; i++) {
              assert.strictEqual(result[i], lba);
            }
            if (--remaining === 0) {
              done();
            }
          };
        }; 
        for (var i = 1; i <= 10; i++) {
          var buffer = new Buffer(512);
          memoryDriver.readBlock(i, buffer, callback(i));
        }
      });
    });
  });
  describe('크기 1000000000, 게으른 할당 시험', function () {
    var memoryDriver = null;
    it('초기화 성공해야 합니다.', function () {
      var config = {
        size: 1000000000
      };
      memoryDriver = new MemoryDriver(config);
    });
    it('getLastLogicalBlockAddress가 1000000000을 반환해야 합니다.', function () {
      assert.strictEqual(memoryDriver.getLastLogicalBlockAddress(), 1000000000);
    });
    it('임의 번지에 쓰기, 읽기 작업을 100회 반복합니다.', function (done) {
      var remaining = 100;
      
      var rand = (function (seed) {
        return function () {
          seed = seed * 279470273 % 4294967291;
          return seed;
        };
      })(42);

      function unitTask() {
        if (remaining-- === 0) {
          return done();
        }
        var lba = rand() % 1000 + 1;
        var bufferExpect = new Buffer(512);
        for (var i = 0; i < 512; i++) {
          bufferExpect[i] = rand() % 256;
        }
        memoryDriver.writeBlock(lba, bufferExpect, function (err, bufferWrite) {
          assert.strictEqual(err, null);
          assert.strictEqual(bufferExpect, bufferWrite);
          var bufferActual = new Buffer(512);
          memoryDriver.readBlock(lba, bufferActual, function (err, result) {
            assert.strictEqual(err, null);
            assert.strictEqual(bufferActual, result);
            assert.notStrictEqual(bufferExpect, bufferActual);
            for (var i = 0; i < 512; i++) {
              assert.strictEqual(bufferExpect[i], bufferActual[i]);
            }
            process.nextTick(unitTask);
          });
        });
      }
      unitTask();
    });
  });
});