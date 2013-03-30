test('oh shit', function () {
  window.location = 'http://localhost:3000';
  expect($('#user-list').length).to.equal(1);
});
