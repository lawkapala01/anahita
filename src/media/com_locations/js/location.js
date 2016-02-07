/**
 * Author: Rastin Mehr
 * Email: rastin@anahitapolis.com
 * Copyright 2015 rmdStudio Inc. www.rmdStudio.com
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

;(function ($, window, document) {

    'use strict';

    $.widget("anahita.locations", {

      options : {

        //selector's modal
        modal : '#an-modal',

        formSelector : 'a[data-trigger="FormSelector"]',

        //selector's form container
        formContainer : '#location-form-container',

        //link that opens the location selector modal
        loationsSelector : '[data-trigger*="LocationSelector"]',

        //selector's locations container
        locationsContainer : '#locations-container',

        //selector's search box
        searchQuery : '#an-search-query',

        //location entities
        entities : '.an-entities',

        //location entity
        entity : '.an-entity',

        //locatable's location list
        locationsList : '.an-locations'
      },

      _create : function () {

        var self = this;
        this.modal = $(this.options.modal);

        this.formContainer = null;
        this.locationsContainer = null;
        this.currentList = null;
        this.locatableId = null;

        //show selector event
        this._on(this.options.loationsSelector, {
          click : function ( event ) {
            event.preventDefault();
            self.locatableId = $(event.currentTarget).data('locatable');
            self._showSelector( event.currentTarget );
          }
        });

        $(this.options.locationsList).each(function(index, list){
          $(list).load($(list).data('url'));
        });

        //listen to the filter box. If no locations are available, show the form
        this._on( $(document), {
          'afterFilterbox' : function( event ) {
            var results = self.locationsContainer.find(this.options.entity);
            if (results.length == 0) {
                self._showForm();
            }
          }
        });
      },

      _showSelector : function ( target ) {

        var self = this;

        this.modal.find('.modal-footer').hide();

        var header = this.modal.find('.modal-header').find('h3');

    		var body = this.modal.find('.modal-body');

        $.get( $(target).data('url'), function (response) {

            header.html($(response).filter('.modal-header').html());

            body.html($(response).filter('.modal-body').html());

            self.modal.modal('show');

            self.formContainer = $(self.options.formContainer);

            self.locationsContainer = $(self.options.locationsContainer);

            self.searchQuery = $(self.options.searchQuery);

            self.formContainer.hide();

            self._browse();
    		});
      },

      _browse : function () {

        var self = this;
        var entities = self.locationsContainer.find(this.options.entities);

        var browser_latitude = null;
        var browser_longitude = null;

        if($('body').data('browser_coords')){
            var browser_coords = $('body').data('browser_coords');
            var browser_latitude = browser_coords.latitude;
            var browser_longitude = browser_coords.longitude;
        }

        $.ajax({
            method : 'GET',
            url : entities.data('url'),
            data : {
              'nearby_latitude' : browser_latitude,
              'nearby_longitude' : browser_longitude
            },
            success : function (response) {

                var entity = $(response).filter(self.options.entity);

                if (entity.length) {
                    self._hideForm();
                    $(entities).html(entity);
                } else {
                    self._showForm();
                }
            }
        });

      },

      _add : function(){

        var self = this;

        var form = self.formContainer.find('form');

        $.ajax({
          method : 'POST',
          url : form.attr('action'),
          data : form.serialize(),
          beforeSend : function (){
            form.find(':submit').button('loading');
          },
          success : function ( response ) {
            self._refresh();
            self.modal.modal('hide');
          },
          complete : function ( xhr, status ) {
              form.find(':submit').button('reset');
          }
        });
      },

      _showForm : function() {

        var self = this;

        this.formContainer.show();

        this.locationsContainer.hide();

        var form = this.formContainer.find('form');

        this._on(form, {
            submit : function(event){
                event.preventDefault();
                self._add();
            }
        });

        //show form event
        this._on(this.options.formSelector, {
          click : function ( event ) {
            event.preventDefault();
            self._hideForm();
          }
        });

        if ( this.searchQuery.val() ) {
            $(form).find('input[name="name"]').val(this.searchQuery.val());
        }
      },

      _hideForm : function() {
        this.formContainer.hide();
        this.locationsContainer.show();
      },

      addLocation : function ( actionLink ) {

        var self = this;
        var elem = $(actionLink);

        $.ajax({
          method : 'POST',
          url : elem.data('url'),
          data : {
            action : 'addlocation',
            location_id : elem.data('location')
          },
          success : function ( response ) {
            self.modal.modal('hide');
            self._refresh();
          }
        });
      },

      deleteLocation : function ( actionLink ) {

        var self = this;
        var elem = $(actionLink);

        $.ajax({
          method : 'POST',
          url : elem.data('url'),
          data : {
            action : 'deletelocation',
            location_id : elem.data('location')
          },
          success : function ( response ) {
            elem.closest('li').fadeOut();
          }
        });
      },

      _refresh : function () {

        var self = this;
        var locationList = $('#locations-' + this.locatableId);

        $.ajax({
          method : 'GET',
          url : locationList.data('url'),
          success : function ( response ) {
             locationList.html(response);
          }
        });
      }
    });

    if($('.an-locations').length){



        var locationWidget = $('body').locations();

        $('body').on('click', 'a[data-action="add-location"]', function( event ) {
            event.preventDefault();
            locationWidget.locations('addLocation', this);
        });

        $('body').on('click', 'a[data-action="delete-location"]', function( event ) {
            event.preventDefault();
            locationWidget.locations('deleteLocation', this);
        });
    }


}(jQuery, window, document));
