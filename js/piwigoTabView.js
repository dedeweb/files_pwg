/*
 * Copyright (c) 2015
 *
 * This file is licensed under the Affero General Public License version 3
 * or later.
 *
 * See the COPYING-README file.
 *
 */

(function() {
	

	/**
	 * @memberof OCA.Sharing
	 */
	var PiwigoTabView = OCA.Files.DetailTabView.extend(
		/** @lends OCA.Sharing.ShareTabView.prototype */ {
		id: 'piwigoTabView',
		className: 'tab piwigoTabView',

		template: function(params) {
			if (!this._template) {
				this._template = Handlebars.compile(TEMPLATE);
			}
			return this._template(params);
		},

		getLabel: function() {
			return t('files_piwigo', 'Piwigo');
		},

		/**
		 * Renders this details view
		 */
		render: function() {
			var html = '';
			
			if(this.model) {
				if(!this.model.attributes.piwigoLink) {
					html += '<div id="pwgDrop" class="pwgUI">';
					html += '<form action="#" id="pwgForm">';
					html += '<input id="linkname"  type="text" placeholder="dir name" value="'+ this._tidyString(this.model.attributes.name) +'"><br>';
					html += '<input type="hidden" id="filename" value="'+this.model.attributes.name+'" />';
					html += '<input type="submit" id="pwgLinkDir" value="link" />';
					html += '<strong id="pwgWarning"></strong></form>';
					html += '</div>';
				} else {
					html += '<input id="linkname" disabled="disabled"  type="text" placeholder="dir name" value="'+ this.model.attributes.piwigoLink +'"><br>';
					html += '<br/><a class="pwglink" href="http://photos.dedeweb.fr/admin.php">';
					html += 'aller dans piwigo ! ';
					html += '</a>';
				}
			}
			
			this.$el.html(html);
			
			this.$el.find('#pwgForm').on('submit', this._submitForm.bind(this));
		},
		canDisplay: function (fileInfo){
			return fileInfo != null && fileInfo.isDirectory() && fileInfo.attributes.path == '/photos';
		},
		_getParentDir : function () {
			return  $('#dir').val();
		},
		/**
		 * Tidy file name
		 */
		_tidyString: function(s) {
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
		},
		_submitForm : function() {
			var filename = this.$el.find('#filename').val();
			var linkname = this.$el.find('#linkname').val();
			var dirname = this._getParentDir();
			var that = this;
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
						that.model.attributes.piwigoLink = linkname;
						that.render();
						
					}
					console.log(data)
				}
			});
			
			
			return false;
		}
	});

	OCA.Piwigo.PiwigoTabView = PiwigoTabView;
})();
