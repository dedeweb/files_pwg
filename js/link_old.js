/**
 * ownCloud - Files_pwg
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author eotryx <mhfiedler@gmx.de>
 * @copyright eotryx 2015
 */

if(!OCA.Files_pwg){
	/**
	 * Namespace for the Files_pwg app
	 * @namespace OCA.Files_pwg
	 */
	OCA.Files_pwg = {};
}
/**
 * @namespace OCA.Files_mv.move
 */
OCA.Files_pwg.Link = {
	/**
	 * @var string appName used for translation file
	 * as transifex uses the github project name, use this instead of the appName
	 */
	appName: 'oc_files_pwg',
	registerFileAction: function(){
		//var img = OC.imagePath('core','actions/external');
		OCA.Files.fileActions.registerAction({
			name: t(this.appName,'Piwigo'),
			displayName: '',
			mime: 'all',
			permissions: OC.PERMISSION_READ,
			icon: OC.imagePath('core','actions/external'),
			type: OCA.Files.FileActions.TYPE_INLINE,
			actionHandler: function(file) { 
				if (($('#pwgDrop').length > 0)) {
					$('#pwgDrop').detach();
				}
				else{
					OCA.Files_pwg.Link.createUI(true,file,false);
				}
			}			
		});
		
	},
	initialize: function(a,b,c){
		this.registerFileAction();
		var linkListPromise = $.ajax({
			type: 'GET',
			url: OC.generateUrl('/apps/files_pwg/listlinks'),
			cache: false
		});
		$('#fileList').on('fileActionsReady',function(){
			linkListPromise.then( function(data){
				if(data.status == 'success') {
					//that.linkList = data.links;
					var links = data.links;
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
					});
				}
			});
		});
		
		

		$('#pwgForm').live('submit',this.submit);
	},	

	submit: function(){
		var filename = $('#filename').val();
		var linkname = $('#linkname').val();
		var dirname = $('#dir').val();
	
		$.ajax({
			type: 'POST',
			url: OC.generateUrl('/apps/files_pwg/link'),
			cache: false,
			data: {filename: filename, linkname: linkname, dirname : dirname},
			success: function(data){
				
				console.log(data.name, data);
				
				// show error messages when caught some
				if(data.status=="error"){
					OC.dialogs.alert(data.message , "erreur piwigo")
					
				} else {
					//afficher message OK
					OC.Notification.showTemporary("lien créé avec succès");
				}
				console.log(data)
			}
		});
		
		$('#pwgDrop').detach();
		return false;
	},
	
	
	/**
	 * draw the move-dialog; if file is readonly, activate copy
	 *
	 * @local - true for single file, false for global use
	 * @file - filename in the local directory
	 */
	createUI: function (local,file){
		// check for update permission
		file2 = file.split(';');
		var permUpdate = true;
		for(var i=0;i<file2.length;++i){
			if(file2[i]== "") continue;
			var tmp = $('tr[data-file="'+file2[i]+'"]');
			if((OC.PERMISSION_UPDATE&parseInt(tmp.attr('data-permissions')))==0){ // keine updaterechte
				permUpdate=false;
				break;
			}
		}

		
		var tidyString= function(s){
            var r=s.toLowerCase();
            //accents
            r = r.replace(new RegExp(/[àáâãäå]/g),"a");
            r = r.replace(new RegExp(/æ/g),"ae");
            r = r.replace(new RegExp(/ç/g),"c");
            r = r.replace(new RegExp(/[èéêë]/g),"e");
            r = r.replace(new RegExp(/[ìíîï]/g),"i");
            r = r.replace(new RegExp(/ñ/g),"n");                
            r = r.replace(new RegExp(/[òóôõö]/g),"o");
            r = r.replace(new RegExp(/œ/g),"oe");
            r = r.replace(new RegExp(/[ùúûü]/g),"u");
            r = r.replace(new RegExp(/[ýÿ]/g),"y");
        
            //keep only alphanum
            r = r.replace(/\s+/g, '_');
            r = r.replace(/[^a-zA-Z0-9_]+/g, "");
            r = r.replace(/[_]+/g,'_');
           
			
			
            return r;
        };

		var defaultDest = tidyString(file);
		
		
		//set copy as default when current directory is located in shared dir 
		//var copy = ($('#dir').val().substring(0,7)=="/Shared"); 

		var html = '<div id="pwgDrop" class="pwgUI">';
		html += '<form action="#" id="pwgForm">';
		html += '<input id="linkname" placeholder="'+t(this.appName,'Dir Name')+'" value="'+defaultDest+'"><br>';
		html += '<input type="hidden" id="filename" value="'+file+'" />';
		html += '<input type="submit" id="pwgLinkDir" value="'+t(this.appName,'Link')+'" />';
		html += '<strong id="pwgWarning"></strong></form>';
		html += '</div>';
		if(local){
			$(html).appendTo($('tr').filterAttr('data-file',file).find('td.filename'));
		}
		else{
			$(html).addClass('pwg').appendTo('#headerName .selectedActions');
		}
		
		$('#pwgDirName').focus();
	},
}
$(document).ready(function() {
	/**
	 * check whether we are in files-app and we are not in a public-shared folder
	 */
	if(!OCA.Files){ // we don't have the files app, so ignore anything
		return;
	}
	if(/(public)\.php/i.exec(window.location.href)!=null){
		return; // escape when the requested file is public.php
	}
	
	/**
	 * Init Files_mv
	 */
	OCA.Files_pwg.Link.initialize();
});
