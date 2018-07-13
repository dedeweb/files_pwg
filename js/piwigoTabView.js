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
    /** @lends OCA.Sharing.ShareTabView.prototype */
    {
      id: 'piwigoTabView',
      className: 'tab piwigoTabView',
      getLinkList: function () {},
      template: function(params) {
        if (!this._template) {
          this._template = Handlebars.compile(TEMPLATE);
        }
        return this._template(params);
      },
      fileList: null,
      getLabel: function() {
        return t('files_piwigo', 'Piwigo');
      },

      /**
       * Renders this details view
       */
      render: function() {
        var html = '';

        if (this.model) {
          if (!this.model.attributes.piwigoLink) {
            html += '<div id="pwgDrop" class="pwgUI">';
            html += '<form action="#" id="pwgForm">';
            html += '<input id="linkname"  type="text" placeholder="dir name" value="' + this._tidyString(this.model.attributes.name) + '"><br>';
            html += '<input type="hidden" id="filename" value="' + this.model.attributes.name + '" />';
            html += '<input type="submit" id="pwgLinkDir" value="link" />';
            html += '<strong id="pwgWarning"></strong></form>';
            html += '</div>';
            $('tr[data-id='+this.model.id+']').removeAttr('data-pwg-link');
            $('tr[data-id='+this.model.id+']').find('.action-piwigo').removeClass('pwg-linked');
          } else {
            html += '<input id="linkname" disabled="disabled"  type="text" placeholder="dir name" value="' + this.model.attributes.piwigoLink + '"><br>';
            html += '<div id="album-wrapper"></div>';
            html += '<br/><a class="pwglink" id="adm-link" href="https://photos.dedeweb.fr/album/admin.html?album=' + this.model.attributes.piwigoLink + '" target="_blank">';
            html += 'aller dans piwigo ! ';
            html += '</a>';
            html += '<a href="#" class="action delete icon icon-delete has-tooltip" title="" data-original-title="delete link"></a>';
            $('tr[data-id='+this.model.id+']').attr('data-pwg-link',this.model.attributes.piwigoLink);
            $('tr[data-id='+this.model.id+']').find('.action-piwigo').addClass('pwg-linked');
          }
        }

        this.$el.html(html);

        this.$el.find('#pwgForm').on('submit', this._submitForm.bind(this));
        this.$el.find('.delete').click(this._deleteLink.bind(this));

        var _this = this;
        this._getShareToken(function(token) {
          if (token) {
            _this.$el.find('#adm-link').attr('href', 'https://photos.dedeweb.fr/album/admin.html?album=' + _this.model.attributes.piwigoLink + '&token=' + token);
            _this.$el.find('#album-wrapper').html(_this._htmlFromToken(token, _this.model.attributes.id));
          }
        });

        var clipboard = new Clipboard('.clipboardButton');
        
        
        
      },
      canDisplay: function(fileInfo) {
        return fileInfo != null && fileInfo.isDirectory() && fileInfo.attributes.path == '/photos';
      },
      _getParentDir: function() {
        return $('#dir').val();
      },
      /**
       * Tidy file name
       */
      _tidyString: function(s) {
        var r = s.toLowerCase();
        //accents
        r = r.replace(new RegExp(/[àáâãäå]/g), "a");
        r = r.replace(new RegExp(/æ/g), "ae");
        r = r.replace(new RegExp(/ç/g), "c");
        r = r.replace(new RegExp(/[èéêë]/g), "e");
        r = r.replace(new RegExp(/[ìíîï]/g), "i");
        r = r.replace(new RegExp(/ñ/g), "n");
        r = r.replace(new RegExp(/[òóôõö]/g), "o");
        r = r.replace(new RegExp(/œ/g), "oe");
        r = r.replace(new RegExp(/[ùúûü]/g), "u");
        r = r.replace(new RegExp(/[ýÿ]/g), "y");

        //keep only alphanum
        r = r.replace(/\s+/g, '_');
        r = r.replace(/[^a-zA-Z0-9_]+/g, "");
        r = r.replace(/[_]+/g, '_');



        return r;
      },
      _htmlFromToken: function(token, id) {
        var html = '<div class="oneline">';
        html += '<input class="linkText" id="pwgLinkText" type="text" readonly="readonly" value="https://photos.dedeweb.fr/album/' + token + '">';
        html += '<a class="clipboardButton icon icon-clippy" data-clipboard-target="#pwgLinkText">';
        html += '</a></div>';
        return html;
      },
      _submitForm: function() {
        var filename = this.$el.find('#filename').val();
        var linkname = this.$el.find('#linkname').val();
        var dirname = this._getParentDir();
        var that = this;
        $.ajax({
          type: 'POST',
          url: OC.generateUrl('/apps/files_pwg/link'),
          cache: false,
          data: {
            filename: filename,
            linkname: linkname,
            dirname: dirname
          },
          success: function(data) {

            console.log(data.name, data);

            // show error messages when caught some
            if (data.status == "error") {
              OC.dialogs.alert(data.message, "erreur piwigo")

            } else {
              //afficher message OK
              OC.Notification.showTemporary("lien créé avec succès");
              that.model.attributes.piwigoLink = linkname;
              that.getLinkList().push({
                file: linkname,
                link: filename
              })
              that.render();
            }
            console.log(data)
          }
        });


        return false;
      },
      _deleteLink: function() {
        var that = this;
        var linkname = this.$el.find('#linkname').val();
        OC.dialogs.confirm('Etes vous sur de vouloir supprimer le lien?', 'Suppression du lien', function(confirm) {
          if (confirm) {
            $.ajax({
              type: 'DELETE',
              url: OC.generateUrl('/apps/files_pwg/link'),
              cache: false,
              data: {
                linkname: linkname
              },
              success: function(data) {
                // show error messages when caught some
                if (data.status == "error") {
                  OC.dialogs.alert(data.message, "erreur lors de la suppresion")

                } else {
                  //afficher message OK
                  OC.Notification.showTemporary("lien supprimé avec succès");
                  that.model.attributes.piwigoLink = null;
                  that.getLinkList().splice(that.getLinkList().findIndex(x => x.file === linkname),1);
                  that.render();
                }
                console.log(data)
              }
            });

          }
        }, true);
      },
      _getShareToken: function(token_cb) {
        if (this.model) {
          $.ajax({
            type: 'GET',
            url: OC.generateUrl('/ocs/v2.php/apps/files_sharing/api/v1/shares') + '?format=json&path=' + encodeURIComponent(this.model.attributes.path + '/' + this.model.attributes.name),
            success: function(data) {
              console.log('success');
              if (data.ocs.data && data.ocs.data.length > 0) {
                token_cb(data.ocs.data[0].token);
              } else {
                console.log('no token');
                token_cb();
              }
            },
            error: function() {
              token_cb();
            }
          });
        }

      }
    });

  OCA.Piwigo.PiwigoTabView = PiwigoTabView;
})();