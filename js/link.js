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
			/*if (!OC.Share) {
				return;
			}*/
			if (fileList.id === 'trashbin' || fileList.id === 'files.public') {
				return;
			}
			var fileActions = fileList.fileActions;
			var oldCreateRow = fileList._createRow;
			var linkListPromise = $.ajax({
				type: 'GET',
				url: OC.generateUrl('/apps/files_pwg/listlinks'),
				cache: false
			});

			//Not very clean :-(
			var originalElementToFile = fileList.elementToFile
			fileList.elementToFile = function($el){
				data = originalElementToFile($el);
				data.piwigoLink = $el.attr('data-pwg-link');
				return data;
			};
			// use delegate to catch the case with multiple file lists
			fileList.$el.on('fileActionsReady', function(ev){
				var $files = ev.$files;
				
				linkListPromise.then( function(data){
					if(data.status == 'success') {
						//that.linkList = data.links;
						var links = data.links;
						_.each($files, function(file) {
							var $tr = $(file);
							if(!$tr.data('pwg-processed')){
								var fileName = $tr.data('file');
								_.each(links, function (curLink) {
									if(curLink.link == fileName) {
										$tr.attr('data-pwg-link', curLink.file);
										$tr.find('.action-piwigo').addClass('pwg-linked');
										//$tr.find('.action-piwigo').append(' Publié');
									} 
								});
								$tr.data('pwg-processed', true);
							}
						});
						/*
						$('.action-piwigo').each(function (){
							if(!$(this).data('processed')){
								var fileName = $(this).parents('tr').data('file');
								var curElt = $(this);
								$.each(links, function (index, curLink){
									if(curLink.link == fileName) {
										//lien existant
										curElt.addClass('permanent');
										curElt.unbind('click');
										curElt.append(' ' + curLink.file);
										curElt.addClass('pwg-disabled');
									}
								});
								//On cache pour autre chose que les photos
								$("a.name:not([href*='dir=/photos']) .fileactions .action-piwigo").hide();
								$(this).data('processed',true);
							}
						});*/
					}
				});
				
/*
				_.each($files, function(file) {
					var $tr = $(file);
					var shareTypes = $tr.attr('data-share-types') || '';
					var shareOwner = $tr.attr('data-share-owner');
					if (shareTypes || shareOwner) {
						var hasLink = false;
						var hasShares = false;
						_.each(shareTypes.split(',') || [], function(shareType) {
							shareType = parseInt(shareType, 10);
							if (shareType === OC.Share.SHARE_TYPE_LINK) {
								hasLink = true;
							} else if (shareType === OC.Share.SHARE_TYPE_USER) {
								hasShares = true;
							} else if (shareType === OC.Share.SHARE_TYPE_GROUP) {
								hasShares = true;
							} else if (shareType === OC.Share.SHARE_TYPE_REMOTE) {
								hasShares = true;
							}
						});
						OCA.Sharing.Util._updateFileActionIcon($tr, hasShares, hasLink);
					}
				});*/
			});

			fileActions.registerAction({
				name: t(this.appName,'Piwigo'),
				displayName: '',
				mime: 'all',
				permissions: OC.PERMISSION_READ,
				icon: OC.imagePath('core','actions/external'),
				type: OCA.Files.FileActions.TYPE_INLINE,
				actionHandler: function(fileName) {
					fileList.showDetailsView(fileName, 'piwigoTabView');
				},
				render: function(actionSpec, isDefault, context) {
					if(context.$file.data('mime') == 'httpd/unix-directory' && context.fileList.breadcrumb.dir == '/photos') {
						return fileActions._defaultRenderAction.call(fileActions, actionSpec, isDefault, context);	
					}
					return null;
					/*var permissions = parseInt(context.$file.attr('data-permissions'), 10);
					// if no share permissions but share owner exists, still show the link
					if ((permissions & OC.PERMISSION_SHARE) !== 0 || context.$file.attr('data-share-owner')) {
						
					}
					// don't render anything
					return null;*/
				}
			});

			var piwigoTab = new OCA.Piwigo.PiwigoTabView('piwigoTabView', {order: -20});
			// detect changes and change the matching list entry
			/*piwigoTab.on('sharesChanged', function(shareModel) {
				var fileInfoModel = shareModel.fileInfoModel;
				var $tr = fileList.findFileEl(fileInfoModel.get('name'));
				OCA.Sharing.Util._updateFileListDataAttributes(fileList, $tr, shareModel);
				if (!OCA.Sharing.Util._updateFileActionIcon($tr, shareModel.hasUserShares(), shareModel.hasLinkShare())) {
					// remove icon, if applicable
					OC.Share.markFileAsShared($tr, false, false);
				}
				var newIcon = $tr.attr('data-icon');
				// in case markFileAsShared decided to change the icon,
				// we need to modify the model
				// (FIXME: yes, this is hacky)
				if (fileInfoModel.get('icon') !== newIcon) {
					fileInfoModel.set('icon', newIcon);
				}
			});*/
			fileList.registerTabView(piwigoTab);
		}		
	};
})();

OC.Plugins.register('OCA.Files.FileList', OCA.Piwigo.Util);

