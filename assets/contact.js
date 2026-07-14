(function () {
  'use strict';
  var form = document.getElementById('contactForm');
  var status = document.getElementById('contactStatus');
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var name = document.getElementById('c-name').value.trim();
    var email = document.getElementById('c-email').value.trim();
    var org = document.getElementById('c-org').value.trim();
    var message = document.getElementById('c-msg').value.trim();
    var body = 'Name: ' + name + '\nEmail: ' + email + '\nInstitution / organization: ' + org + '\n\n' + message;
    status.textContent = 'Opening your mail app. Review and send the message there to complete your inquiry.';
    window.location.href = 'mailto:billhowe@uw.edu?subject=' + encodeURIComponent('RAISE inquiry from ' + name) + '&body=' + encodeURIComponent(body);
  });
})();
