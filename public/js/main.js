$(document).ready(function() {

  $('#trackedItems').on('click', '.js-delete-item', function() {
    var selectionId = $(this).closest('[data-item-id]').attr('data-item-id')
      .replace(/"/g, '');
    var deletePath = window.location.pathname +
      '/selections/' + selectionId + '/delete';

    $.post(deletePath, function(res) {
      if (res.redirect) {
        window.location = res.redirect;
      }
    })
      .fail(function(res) {
        console.log(res.responseText);
    });
  });

  $('.js-delete-track').on('click', function() {
    $.ajax({
      method: 'DELETE',
      url: window.location.pathname
    })
      .done(function(res) {
        window.location = res.redirect;
    })
      .fail(function(res) {
        console.log('Failed to delete track.');
    });
  });

  // Set alert validations
  $('#alertForm').on('submit', 'form', function() {
    var form = $('#alertForm');
    var alertComparator = form.find('#alertComparator');
    var lowestPrice = form.data('lowest-price');
    var hasError = false;  

    // Validate alert comparator presence. Inequality validates entry !isNaN
    if (!alertComparator.val() || Number(alertComparator.val()) != Number(alertComparator.val())) {
      alertComparator.closest('.form-group').addClass('has-error');
      $('#comparatorIsRequired').removeClass('is-hidden');
      hasError = true;
    } else {
      $('#comparatorIsRequired').addClass('is-hidden');
    }

    // Validate alert condition is not already met.
    if (alertComparator.val() && alertComparator.val() > form.data('lowest-price')) {
      alertComparator.closest('.form-group').addClass('has-error');
      $('#comparatorConditionMet').removeClass('is-hidden');
      hasError = true;
    } else {
      $('#comparatorConditionMet').addClass('is-hidden');
    }

    if (hasError) {
      return false;
    }
  });

  $('#alertComparator').on('focus', function() {
    $(this).closest('.has-error').removeClass('has-error');
    $('#comparatorIsRequired').addClass('is-hidden');
    $('#comparatorConditionMet').addClass('is-hidden');
  });

});