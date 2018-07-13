/*
 * Copyright (c) 2014
 *
 * This file is licensed under the Affero General Public License version 3
 * or later.
 *
 * See the COPYING-README file.
 *
 */

(function() {
  if (!OCA.Piwigo) {
    OCA.Piwigo = {};
  }
  /**
   * @namespace
   */
  OCA.Piwigo.Util = {
    /**
     * Initialize the piwiog plugin.
     *
     * Registers the "Share" file action and adds additional
     * DOM attributes for the sharing file info.
     *
     * @param {OCA.Files.FileList} fileList file list to be extended
     */
    attach: function(fileList) {
      // core sharing is disabled/not loaded

      if (fileList.id === 'trashbin' || fileList.id === 'files.public') {
        return;
      }
      var fileActions = fileList.fileActions;
      var oldCreateRow = fileList._createRow;
      var linkList = [];
      var linkListPromise = $.ajax({
        type: 'GET',
        url: OC.generateUrl('/apps/files_pwg/listlinks'),
        cache: false
      }).then(function (data) {
         if (data.status == 'success') {
            //that.linkList = data.links;
            linkList = data.links;
         }
      });

      //Not very clean :-(
      var originalElementToFile = fileList.elementToFile
      fileList.elementToFile = function($el) {
        data = originalElementToFile($el);
        data.piwigoLink = $el.attr('data-pwg-link');
        return data;
      };
      // use delegate to catch the case with multiple file lists
      fileList.$el.on('fileActionsReady', function(ev) {
        var $files = ev.$files;

        linkListPromise.then(function() {
          if (linkList) {
            //that.linkList = data.links;
            _.each($files, function(file) {
              var $tr = $(file);
              if (!$tr.data('pwg-processed')) {
                var fileName = $tr.data('file');
                _.each(linkList, function(curLink) {
                  if (curLink.link == fileName) {
                    $tr.attr('data-pwg-link', curLink.file);
                    $tr.find('.action-piwigo').addClass('pwg-linked');
                    //$tr.find('.action-piwigo').append(' Publié');
                  }
                });
                $tr.data('pwg-processed', true);
              }
            });

          }
        });


      });

      fileActions.registerAction({
        name: t(this.appName, 'Piwigo'),
        displayName: '',
        mime: 'all',
        permissions: OC.PERMISSION_READ,
        icon: OC.imagePath('core', 'actions/external'),
        type: OCA.Files.FileActions.TYPE_INLINE,
        actionHandler: function(fileName) {
          fileList.showDetailsView(fileName, 'piwigoTabView');
        },
        render: function(actionSpec, isDefault, context) {
          if (context.$file.data('mime') == 'httpd/unix-directory' && context.fileList.breadcrumb.dir == '/photos') {
            return fileActions._defaultRenderAction.call(fileActions, actionSpec, isDefault, context);
          }
          return null;

        }
      });

      var piwigoTab = new OCA.Piwigo.PiwigoTabView('piwigoTabView', {
        order: -20
      });
      piwigoTab.getLinkList =  function () { return linkList;};
      

      fileList.registerTabView(piwigoTab);
    }
  };
})();

OC.Plugins.register('OCA.Files.FileList', OCA.Piwigo.Util);