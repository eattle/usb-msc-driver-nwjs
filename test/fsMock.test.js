const assert = require('assert');
const Riccardo = require('riccardo');
var riccardo = new Riccardo();
riccardo.scan('../lib', '');
riccardo.factory('fsMock', require('./fsMock'));

describe('FsMock', function () {
  const FsMock = riccardo.get('fsMock');
  it('컴포넌트가 있어야 합니다.', function () {
    assert(FsMock);
  });

  describe('시나리오 시험', function () {
    var mock = null;
    it('생성되어야 합니다.', function () {
      mock = new FsMock();
      assert.strictEqual(typeof mock, typeof {});
    });
    it('새로운 블록 파일 /dev/disk0을 엽니다.', function (done) {
      mock.open('/dev/disk0', '', function (err, fd) {
        assert.strictEqual(err, null);
        assert.strictEqual(fd, 1);
        mock.setMockType('/dev/disk0', 'type', 'blockDevice');
        mock.setMockType('/dev/disk0', 'size', 623 * 512);
        done();
      });
    });
    it('새로운 이미지 파일 /img/image0을 엽니다.', function (done) {
      mock.open('/img/image0', '', function (err, fd) {
        assert.strictEqual(err, null);
        assert.strictEqual(fd, 2);
        mock.setMockType('/img/image0', 'type', 'file');
        done();
      });
    });
    it('/dev/disk0은 블록 장치입니다.', function (done) {
      mock.stat('/dev/disk0', function (err, stats) {
        assert.strictEqual(err, null);
        assert.strictEqual(stats.isBlockDevice(), true);
        assert.strictEqual(stats.isFile(), false);
        done();
      });
    });
    it('/img/image0은 파일입니다.', function (done) {
      mock.stat('/img/image0', function (err, stats) {
        assert.strictEqual(err, null);
        assert.strictEqual(stats.isBlockDevice(), false);
        assert.strictEqual(stats.isFile(), true);
        done();
      });
    });
    it('파일 디스크립터 3에 접근 실패합니다.');
    it('/img/image0을 닫습니다.', function (done) {
      mock.close(2, function () {
        done();
      });
    });
    it('/dev/disk0을 닫습니다.', function (done) {
      mock.close(1, function () {
        done();
      });
    });
    it('파일 디스크립터 1에 접근 실패합니다.');
    it('파일 디스크립터 2에 접근 실패합니다.');
    it('파일 디스크립터 3에 접근 실패합니다.');
  });
});