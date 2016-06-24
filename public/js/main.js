$(document).ready(function() {

  // $('#trackedItems').on('click', '.js-delete-item', function() {
  //   var selectionId = $(this).closest('[data-item-id]').attr('data-item-id')
  //     .replace(/"/g, '');
  //   var deletePath = window.location.pathname +
  //     '/selections/' + selectionId + '/delete';

  //   $.post(deletePath, function(res) {
  //     if (res.redirect) {
  //       window.location = res.redirect;
  //     }
  //   })
  //     .fail(function(res) {
  //       console.log(res.responseText);
  //   });
  // });

  $('#trackedItems').on('click', '.js-delete-scrape', function() {
    var confirmation = window.confirm('Are you sure?');
    if (!confirmation) return false;

    var target = this;
    var scrapeId = $(target).closest('[data-item-id]').attr('data-item-id').replace(/"/g, '');
    var deletePath = window.location.pathname + '/' + scrapeId + '/delete';
    $.post(deletePath, function(res) {
      if (res.success) {
        $(target).closest('tr').hide();
      }
    })
      .fail(function(res) {
        console.log(res.responseText);
      });
  });

  $('#trackedItems').on('click', '.js-edit-scrape', function() {
    $(this).parent().parent().children('td').eq(3).attr('contenteditable', '').css('background', '#89C4F4');
    $(this).children('i').removeClass('fa-pencil').addClass('fa-check');
    $(this)
      .removeClass('btn-pencil')
      .removeClass('pencil-btn-icon-only')
      .removeClass('js-edit-scrape')
      .addClass('btn-check')
      .addClass('check-btn-icon-only')
      .addClass('js-save-scrape');
  });

  $('#trackedItems').on('click', '.js-save-scrape', function() {
    var target = this;
    var scrapeId = $(target).closest('[data-item-id]').attr('data-item-id').replace(/"/g, '');
    var comparator = $(target).parent().parent().children('td').eq(3).text();
    var editPath = window.location.pathname + '/' + scrapeId + '/edit';
    $.post(editPath, { comparator: comparator }, function(res) {
      if (res.success) {
        $(target).parent().parent().children('td').eq(3).removeAttr('contenteditable').css('background', 'none');
        $(target).children('i').removeClass('fa-check').addClass('fa-pencil');
        $(target)
          .addClass('btn-pencil')
          .addClass('pencil-btn-icon-only')
          .addClass('js-edit-scrape')
          .removeClass('btn-check')
          .removeClass('check-btn-icon-only')
          .removeClass('js-save-scrape');
        } else {
          if ($('.alert')) {
            $('.alert').remove();
          }
          $('.flash-container').prepend('<div class="alert alert-danger fade in">');
          $('.alert-danger').append('<button type="button" data-dismiss="alert" class="close">');
          $('.close').append('<i class="fa fa-times-circle-o">');
          res.errors.forEach(function(error) {
            var message = $('<div>').text(error.msg);
            $('.alert-danger').append(message);
          });
        }
    })
      .fail(function(res) {
        console.log(res.responseText);
      });
  });



  // $('.js-delete-track').on('click', function() {
  //   $.ajax({
  //     method: 'DELETE',
  //     url: window.location.pathname
  //   })
  //     .done(function(res) {
  //       window.location = res.redirect;
  //   })
  //     .fail(function(res) {
  //       console.log('Failed to delete track.');
  //   });
  // });

  // Set alert validations
  // $('#alertForm').on('submit', 'form', function() {
  //   var form = $('#alertForm');
  //   var alertComparator = form.find('#alertComparator');
  //   var lowestPrice = form.data('lowest-price');
  //   var hasError = false;  

  //   // Validate alert comparator presence. Inequality validates entry !isNaN
  //   if (!alertComparator.val() || Number(alertComparator.val()) != Number(alertComparator.val())) {
  //     alertComparator.closest('.form-group').addClass('has-error');
  //     $('#comparatorIsRequired').removeClass('is-hidden');
  //     hasError = true;
  //   } else {
  //     $('#comparatorIsRequired').addClass('is-hidden');
  //   }

  //   // Validate alert condition is not already met.
  //   if (alertComparator.val() && alertComparator.val() > form.data('lowest-price')) {
  //     alertComparator.closest('.form-group').addClass('has-error');
  //     $('#comparatorConditionMet').removeClass('is-hidden');
  //     hasError = true;
  //   } else {
  //     $('#comparatorConditionMet').addClass('is-hidden');
  //   }

  //   if (hasError) {
  //     return false;
  //   }
  // });

  // $('#alertComparator').on('focus', function() {
  //   $(this).closest('.has-error').removeClass('has-error');
  //   $('#comparatorIsRequired').addClass('is-hidden');
  //   $('#comparatorConditionMet').addClass('is-hidden');
  // });

});