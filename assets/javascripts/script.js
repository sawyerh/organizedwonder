var inframe = top != self
var holder_text = '';

$(document).ready(function() {
  /*  set first featured video as 'current' */
  $('article:first').addClass('current');
});

$(function() {
    $('.featured-videos article').on('mouseover', function(){
        $('.featured-videos article.current').removeClass('current');
        $(this).addClass('current');
    });

    $('.saved').hover(function(){
        var $this = $(this);
        holder_text = $this.html();
        $this.html( $this.attr('title') );
        $this.addClass('remove');
    }, function(){
        var $this = $(this);
        $this.html( holder_text );
        $this.removeClass('remove');
    });

    $('.nav-toggle').on('click', function(){
        $('header.primary nav').slideToggle();
    });

    // Display users who liked a video
    $('.saves_count').on('click', function(){
        $('.saving-users', $(this).parent()).slideToggle();
    });

    /*  Forms
     ************************************************************************/
    if( $('.auth-wrap > .social-options').length ){
        var $social_buttons = $('.auth-wrap > .social-options');
        var wrap_height = $('.auth-wrap').height();
        var s_height = $social_buttons.height();

        $social_buttons.css('marginTop', (wrap_height - s_height) / 2);
    }


    // Use document so that the event fires for elements appended to the DOM at a later time
    $(document).on('click', '.autofill', function(){
        var $this = $(this);
        var $field = $('input, textarea', $this.parent());
        var autofill = $field.attr('data-autofill');
        $field.val(autofill);

        $this.hide();
    });


    // Autocomplete
    var tags_array = $('#video_tag_list').attr('data-tags');
    autoComplete();

    // Verify form data
    formVerifications();

    // Change password
    $('.change-password-toggle').on('click', function(){
        $('#change-password').slideToggle();
    });

    /*  Like AJAX
     ************************************************************************/
    $('.like-toggle').click(function(){
        $('form.likes-form').submit();
        return false;
    });

    /* Save AJAX
    ************************************************************************/
    $(document).on('click', '.save_button, .watch-later:not(.remove)', function(e){

        var $button = $(this);
        var isQueue = $button.hasClass('watch-later');
        var runAJAX = true;

        if( $button.hasClass('require_auth') ){
            return true;
        } else {
            e.preventDefault();
        }

        $button.addClass('loading');

        var url = '/videos/' + $button.attr('data-id') + '/save';

        if( isQueue ){
            url = '/videos/' + $button.attr('data-id') + '/queue';

            if( $button.hasClass('remove') ){
                runAJAX = false;
            }
        }

        if( runAJAX ){

            $.get( url, function(data) {

                if( data[0] == "success" ) {
                    // Saving a video
                    if( !isQueue ){
                        $button.hide();
                        $('.unsave', $button.parent()).show();
                        var current_saves_count = data[1]["saves"];

                        $('.saves_count strong').html( current_saves_count );

                        if( current_saves_count == 1 )
                            $('.saves_label').html( ' save' );
                        else
                            $('.saves_label').html( ' saves' );

                        // Redirect the user if saved through 'new video' form
                        if( $button.hasClass('save-original') ){
                            var redirectURL = '/videos/' + data[1]["video_id"];

                            // Redirect to bookmarklet 'thanks page' if this wasn't in the popover
                            if( $button.attr('data-popover') != 'yes' ){
                                redirectURL = '/public_pages/share_thanks?video=' + data[1]["video_id"];
                            }

                            window.location = redirectURL;
                        }
                    } else {
                        // Watch Later
                        $button.addClass('remove');
                        console.log('remove');
                    }
                }

                $button.removeClass('loading');
              },
              'json'
            ).fail( function(data) {
                $button.removeClass('loading');
            });
        }

    });

   /* Un-Save AJAX
   ************************************************************************/
   $(document).on('click', '.unsave, .watch-later.remove', function(){

        var $button = $(this);
        var isQueue = $button.hasClass('watch-later');

        $button.addClass('loading');

        var url = '/videos/' + $button.attr('data-id') + '/unsave';

        if( isQueue ){
            url = '/videos/' + $button.attr('data-id') + '/unqueue';
        }

        $.get( url, function(data) {

            if( data[0] == "success" ) {
                if( !isQueue ){
                    var current_saves_count = data[1]["saves"];
                    $button.hide();
                    $('.save', $button.parent()).show();
                    $('.saves_count strong').html( current_saves_count );
                    if( current_saves_count == 1 )
                        $('.saves_label').html( ' save' );
                    else
                        $('.saves_label').html( ' saves' );
                } else {
                    $button.removeClass('remove');
                }
            }

            $button.removeClass('loading');
          },
          'json'
        ).fail( function(data) {
            $button.removeClass('loading');
          }

        );

        return false;
    });

    /*  Follow AJAX
     ************************************************************************/
    $('a.follow').on('click', function(){

        var $button = $(this);
        var username = $button.attr('data-username');
        var url = '/' + username + '/follow';

        $button.addClass('loading');

        $.get( url, function(data) {

                if( data[0] == "success" ) {
                    $button.hide();
                    $('a.unfollow', $button.parent()).show();

                    // Check if the follower count in the sidebar should change
                    if( $button.closest('.user-sidebar').length > 0 ){
                        var current_follower_count = data[1]["followers"];
                        $('.followers').children('.count').html( current_follower_count );
                        if( current_follower_count == 1 )
                            $('.followers').children('.count_label').html( ' follower' );
                        else
                            $('.followers').children('.count_label').html( ' followers' );
                    }
                }

                $button.removeClass('loading');
            },
            'json'
        ).fail( function() {
                //alert("error");
                $button.removeClass('loading');
            }

        );

        return false;
    });

    /*  Un-Follow AJAX
     ************************************************************************/
    $('a.unfollow').on('click', function(){
        var $button = $(this);
        var username = $button.attr('data-username');
        var url = '/' + username + '/unfollow';

        $button.addClass('loading');

        $.get( url, function(data) {

                if( data[0] == "success" ) {
                    $button.hide();
                    $('.follow', $button.parent()).show();

                    // Check if the follower count in the sidebar should change
                    if( $button.closest('.user-sidebar').length > 0 ){
                        var current_follower_count = data[1]["followers"];
                        $('.followers').children('.count').html( current_follower_count );
                        if( current_follower_count == 1 )
                            $('.followers').children('.count_label').html( ' follower' );
                        else
                            $('.followers').children('.count_label').html( ' followers' );
                    }
                }
                $button.removeClass('loading');
            },
            'json'
        ).fail( function() {
                //alert("error");
                $button.removeClass('loading');
            }

        );

        return false;
    });

    /*  Search field
     ************************************************************************/
    $('.search input[type="text"]').focus(function(){
        var $this = $(this);
        var title = $this.attr('title');

        $this.removeClass('default');

        if( $this.val() == title ){
            $this.val('');
        }
    }).blur(function(){
        var $this = $(this);
        var title = $this.attr('title');

        if( $this.val() === '' ){
            $this.val(title);
            $this.addClass('default');
        }
    });

    /*  Search Submit
     ************************************************************************/
    $('.search input[type="submit"]').click(function(){
        var text = $('.search-field', $(this).parent());
        if(text.hasClass('default')){
            text.removeClass('default');
            text.focus();
            return false;
        }
    });

    /*  Popover
     ************************************************************************/
    $('.close-share, .popover-bg').on('click', function(){
        if(inframe){
            window.top.postMessage({action: "exit"}, "*");
        } else {
            $('.popover, .popover-bg').fadeOut();
        }
    });

    $('.show-share').on('click', function(e){
        e.preventDefault();
        var $popover = $('.popover');
        var link = $(this).attr('href');
        $('.popover-bg').fadeIn();
        $popover.fadeIn();

        $('.form-holder', $popover).load(link + ' #new_video', function(response, status, xhr){
            if( status == 'success' ){
                $('.loading', $popover).remove();
                // Setup to redirect to video page after save
                $('#new_video').append('<input type="hidden" name="popover" value="yes" />');
                $('.save-original').attr('data-popover', 'yes');
                formVerifications();
                autoComplete();
            }
        });
    });

    // Tweet popup
    $('.tweet').on('click', function(){
        var width  = 650;
        var height = 500;
        var left   = (screen.width  - width)/2;
        var top    = (screen.height - height)/2;
        var params = 'width='+width+', height='+height;
        params += ', top='+top+', left='+left;
        params += ', directories=no';
        params += ', location=no';
        params += ', menubar=no';
        params += ', resizable=no';
        params += ', scrollbars=no';
        params += ', status=no';
        params += ', toolbar=no';
        newwin=window.open($(this).attr('href'),'Share', params);
        if (window.focus) {newwin.focus();}
        return false;
    });

    /*  Automatic dim lights
     ************************************************************************/

    if( $('body.video').length ){
        // Auto-dim at 60 sec. of idle time
        $.idleTimer(60000);

        $(document).bind("idle.idleTimer", function(){
            $('body').addClass('lights-dimmed');
            $('.popover-bg').fadeIn();
        });

        $(document).bind("active.idleTimer", function(){
            // function you want to fire when the user becomes active again
            $('body').removeClass('lights-dimmed');
            $('.popover-bg').hide();
        });
    }

    /*  Responsivness
     ************************************************************************/
    $('.show-sidebar').on('click', function(){
        $('.sidebar').slideToggle();
    });

    // Responsive Videos
    if(!$('.provider-ted, .provider-blip').length){
        $('.video').fitVids({
          customSelector: "iframe[src^='//cdn.embedly']"
        });
    }

    // Retina graphics
    var screen_size = window.getComputedStyle(document.body,':after').getPropertyValue('content');

    if (screen_size == 'retina') {
        $('img.retina-ready').each(function(index) {
            var retina = $(this).data('retina');
            $(this).attr('src', retina);
        });
    }

});

function ow_split( val ) {
    return val.split( /,\s*/ );
}

function extractLast( term ) {
    return ow_split( term ).pop();
}

// Tag autocomplete
function autoComplete(){
    var $tags = $('#video_tag_list');

    if( $tags.length ){
        var tags_source = $tags.attr('data-source');
        tags_source = tags_source.split(',');

        $tags
        // don't navigate away from the field on tab when selecting an item
        .on( "keydown", function( event ) {
                if ( event.keyCode === $.ui.keyCode.TAB &&
                        $( this ).data( "autocomplete" ).menu.active ) {
                    event.preventDefault();
                }
            })
        .autocomplete({
                minLength: 0,
                source: function( request, response ) {
                    // delegate back to autocomplete, but extract the last term
                    response( $.ui.autocomplete.filter(
                        tags_source, extractLast( request.term ) ) );
                },
                focus: function() {
                    // prevent value inserted on focus
                    return false;
                },
                select: function( event, ui ) {
                    var terms = ow_split( this.value );
                    // remove the current input
                    terms.pop();
                    // add the selected item
                    terms.push( ui.item.value );
                    // add placeholder to get the comma-and-space at the end
                    terms.push( "" );
                    this.value = terms.join( ", " );
                    return false;
                }
        });

        /*
        .autocomplete({
            source: tags_source,
            delay: 0
        });
        */
    }
}

// Form verifications
function formVerifications(){

    // Basic validation
    $('form').on('submit', function(){
        var $form = $(this);
        var form_has_errors = false;

        $('input[type="submit"]', $form).attr('disabled', 'disabled').addClass('loading');

        $('input.required, textarea.required', $form).each(function(){
            var $input = $(this);
            if( $input.val() == '' ){
                form_has_errors = true;
                $input.removeClass('good').addClass('bad shake').on('blur', function(){
                    if( $input.val() != '' ){
                        $input.removeClass('shake bad');
                    }
                });
            }
        });

        $('input[type="url"]', $form).each(function(){

            var $input = $(this);
            var url = $input.val();

            // Test if URL is blank (with placeholder)
            if( url == 'http://' && $input.hasClass('required') ){
                form_has_errors = true;
                $input.removeClass('shake').addClass('bad shake');
            }

        });

        if( $('input[name="video[source]"]', $form).hasClass('bad-embed-url') ){
            form_has_errors = true;
            $('input[name="video[source]"]', $form).removeClass('shake').addClass('shake');
        } else {
            validateVideoURL( $('input[name="video[source]"]', $form), true );
        }

        // Don't allow the form to submit if there are errors
        if( form_has_errors ){
            $('input[type="submit"]', $form).removeAttr('disabled').removeClass('loading');
            return false;
        }

    });

    var $urlField = $('input[name="video[source]"]');

    // Validate video URL is embeddable (Bookmarklet load)
    if( inframe ){
        $(window).load(function(){
            validateVideoURL( $urlField );
        });
    }

    // Validate URL is embeddable (Field blur)
    $urlField.blur(function(){
        validateVideoURL( $urlField, true );
    });

}

function validateVideoURL( field, showForm ){

    if( !showForm ){
        var showForm = false;
    }

    var $field = field;
    var $form = $field.closest('form');
    var url = $field.val();

    // Hide the form in the bookmarklet until the URL is validated
    if( inframe && !showForm ){
        $form.hide();
        $('.loading').show();
    }

    // Don't validate if the URL is the same as last time it was checked or if it's empty
    if( url != '' && url !=  $field.attr('data-checked-url') ){
        $field.addClass('loading').removeClass('bad good duplicate');

        // Add an attribute to indicate what URL was just checked
        $field.attr('data-checked-url', url );

        $.get( '/video/verify',
            { 'video_url': url },
            function(data){
                verifyVideo( data, $field);

                if( inframe && !showForm){
                    // Display form
                    $form.fadeIn();
                    $('.loading').hide();
                }
            }
        );
    }
}

function verifyVideo( data, field ){

    // Check if there is embed html available
    if( data && data['html'] ){
        field.addClass('good').removeClass('loading bad bad-embed-url duplicate'); // opacity for redraw
        field.next('.bad-embed-url').fadeOut().remove();

        // Auto-fill title
        if( data['title'] && data['title'] != '' ){
            $('#video_title').attr('data-autofill', data['title']);

            if( inframe ){
                $('#video_title').val(data['title']);
            } else {
                $('.autofill', $('#video_title').parent()).fadeIn();
            }
        }

        // Check for duplicate videos within "New Video" form
        if( field.closest('form').hasClass('new_video') && data['duplicate_video'] && data['duplicate_video'] != 'none' ){
            field.addClass('duplicate').removeClass('good');
            $('.save-video-button').hide();
            $('.duplicate-save').fadeIn();
            $('.save_button').attr('data-id', data['duplicate_video']);
            $('.duplicate-video-url').attr('href', '/videos/'+data['duplicate_video']);
        } else{
            // Default back to showing the "Save video" button only
            $('.duplicate-save').hide();
            $('.save-video-button').show();
        }
    } else {
        // Bad URL.
        // Just so we don't add an error message multiple times
        if( !field.hasClass('bad-embed-url') ){
            field.addClass('bad bad-embed-url shake').removeClass('loading good');
            field.after('<span class="bad-embed-url error">Sorry, a video couldn\'t be grabbed from this URL. <a href="/faq" target="_blank">Why?</a></span>');
        } else {
            field.removeClass('loading');
        }
    }
}

function trackGAEvent( category, action, label ){
    _gaq.push(['_setAccount','UA-30204540-1']);
    var myTracker = _gat._getTrackerByName();
    _gaq.push(['myTracker._trackEvent', category, action, label]);
}