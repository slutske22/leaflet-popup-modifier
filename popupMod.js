//  Adding new options to the default options of a popup
L.Popup.mergeOptions({
   removable: false,
   editable: false
})

// Modifying the popup mechanics
L.Popup.include({


   // modifying the _initLayout method to include edit and remove buttons, if those options are enabled

   //  ----------------    Source code  ---------------------------- //
   // original from https://github.com/Leaflet/Leaflet/blob/master/src/layer/Popup.js
   _initLayout: function () {
      var prefix = 'leaflet-popup',
          container = this._container = L.DomUtil.create('div',
         prefix + ' ' + (this.options.className || '') +
         ' leaflet-zoom-animated');

      var wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
      this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);

      L.DomEvent.disableClickPropagation(wrapper);
      L.DomEvent.disableScrollPropagation(this._contentNode);
      L.DomEvent.on(wrapper, 'contextmenu', L.DomEvent.stopPropagation);

      this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
      this._tip = L.DomUtil.create('div', prefix + '-tip', this._tipContainer);

      if (this.options.closeButton) {
         var closeButton = this._closeButton = L.DomUtil.create('a', prefix + '-close-button', container);
         closeButton.href = '#close';
         closeButton.innerHTML = '&#215;';

         L.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this);
      }

      //  ----------------    Source code  ---------------------------- //




      //  ---------------    My additions  --------------------------- //

      if (this.options.removable && !this.options.editable){
         var userActionButtons = this._userActionButtons = L.DomUtil.create('div', prefix + '-useraction-buttons', wrapper);
         var removeButton = this._removeButton = L.DomUtil.create('a', prefix + '-remove-button', userActionButtons);
         removeButton.href = '#close';
         removeButton.innerHTML = 'Remove this marker';
         this.options.minWidth = 110;

         L.DomEvent.on(removeButton, 'click', this._onRemoveButtonClick, this);
      }

      if (this.options.editable && !this.options.removable){
         var userActionButtons = this._userActionButtons = L.DomUtil.create('div', prefix + '-useraction-buttons', wrapper);
         var editButton = this._editButton = L.DomUtil.create('a', prefix + '-edit-button', userActionButtons);
         editButton.href = '#edit';
         editButton.innerHTML = 'Edit';

         L.DomEvent.on(editButton, 'click', this._onEditButtonClick, this);
      }

      if (this.options.editable && this.options.removable){
         var userActionButtons = this._userActionButtons = L.DomUtil.create('div', prefix + '-useraction-buttons', wrapper);
         var removeButton = this._removeButton = L.DomUtil.create('a', prefix + '-remove-button', userActionButtons);
         removeButton.href = '#close';
         removeButton.innerHTML = 'Remove this marker';
         var editButton = this._editButton = L.DomUtil.create('a', prefix + '-edit-button', userActionButtons);
         editButton.href = '#edit';
         editButton.innerHTML = 'Edit';
         this.options.minWidth = 160;


         L.DomEvent.on(removeButton, 'click', this._onRemoveButtonClick, this);
         L.DomEvent.on(editButton, 'click', this._onEditButtonClick, this);


      }






   },


   _onRemoveButtonClick: function (e) {
      this._source.remove();
      L.DomEvent.stop(e);
   },

   _onEditButtonClick: function (e) {
      //Needs to be defined first to capture width before changes are applied
      var inputFieldWidth = this._inputFieldWidth = this._container.offsetWidth - 2*19;

      this._contentNode.style.display = "none";
      this._userActionButtons.style.display = "none";

      var wrapper = this._wrapper;
      var editScreen = this._editScreen = L.DomUtil.create('div', 'leaflet-popup-edit-screen', wrapper)
      var inputField = this._inputField = L.DomUtil.create('div', 'leaflet-popup-input', editScreen);
      inputField.setAttribute("contenteditable", "true");
      inputField.innerHTML = this.getContent()


      //  -----------  Making the input field grow till max width ------- //
      inputField.style.width = inputFieldWidth + 'px';
      var inputFieldDiv = L.DomUtil.get(this._inputField);

      // create invisible div to measure the text width in pixels
      var ruler = L.DomUtil.create('div', 'leaflet-popup-input-ruler', editScreen);

      let thisStandIn = this;

      // Padd event listener to the textinput to trigger a check
      this._inputField.addEventListener("keydown", function(){
      // Check to see if the popup is already at its maxWidth
      // and that text doesnt take up whole field
         if (thisStandIn._container.offsetWidth < thisStandIn.options.maxWidth + 38
            && thisStandIn._inputFieldWidth + 5 < inputFieldDiv.clientWidth){
            ruler.innerHTML = inputField.innerHTML;

            // console.clear();
            // console.log(`Text width: ${ruler.offsetWidth}`);
            // console.log(`InputField width: ${inputFieldDiv.clientWidth}`);
            // console.log(`Popup width: ${thisStandIn._container.offsetWidth}`);

            if (ruler.offsetWidth + 20 > inputFieldDiv.clientWidth){
               console.log('expand now');
               inputField.style.width = thisStandIn._inputField.style.width = ruler.offsetWidth + 10 + 'px';
               thisStandIn.update();
            }

         }
      }, false)


      // https://blog.mastykarz.nl/measuring-the-length-of-a-string-in-pixels-using-javascript/
      //  ----------------------------------------------------- ------- //



      var inputActions = this._inputActions = L.DomUtil.create('div', 'leaflet-popup-input-actions', editScreen);
      var cancelButton = this._cancelButton = L.DomUtil.create('a', 'leaflet-popup-input-cancel', inputActions);
      cancelButton.href = '#cancel';
      cancelButton.innerHTML = 'Cancel';
      var saveButton = this._saveButton = L.DomUtil.create('a', 'leaflet-popup-input-save', inputActions);
      saveButton.href = "#save";
      saveButton.innerHTML = 'Save';

      L.DomEvent.on(cancelButton, 'click', this._onCancelButtonClick, this)
      L.DomEvent.on(saveButton, 'click', this._onSaveButtonClick, this)


      this.update();
      L.DomEvent.stop(e);
   },


   _onCancelButtonClick: function (e) {
      L.DomUtil.remove(this._editScreen);
      this._contentNode.style.display = "block";
      this._userActionButtons.style.display = "flex";

      this.update();
      L.DomEvent.stop(e);
   },

   _onSaveButtonClick: function (e) {
      var inputField = this._inputField;
      if (inputField.innerHTML.length > 0){
         this.setContent(inputField.innerHTML)
      } else {
         alert('Enter something');
      };

      L.DomUtil.remove(this._editScreen);
      this._contentNode.style.display = "block";
      this._userActionButtons.style.display = "flex";

      this.update();
      L.DomEvent.stop(e);



   }

})





//
//
//          CCCCCCCCCCCCC   SSSSSSSSSSSSSSS    SSSSSSSSSSSSSSS
//       CCC::::::::::::C SS:::::::::::::::S SS:::::::::::::::S
//     CC:::::::::::::::CS:::::SSSSSS::::::SS:::::SSSSSS::::::S
//    C:::::CCCCCCCC::::CS:::::S     SSSSSSSS:::::S     SSSSSSS
//   C:::::C       CCCCCCS:::::S            S:::::S
//  C:::::C              S:::::S            S:::::S
//  C:::::C               S::::SSSS          S::::SSSS
//  C:::::C                SS::::::SSSSS      SS::::::SSSSS
//  C:::::C                  SSS::::::::SS      SSS::::::::SS
//  C:::::C                     SSSSSS::::S        SSSSSS::::S
//  C:::::C                          S:::::S            S:::::S
//   C:::::C       CCCCCC            S:::::S            S:::::S
//    C:::::CCCCCCCC::::CSSSSSSS     S:::::SSSSSSSS     S:::::S
//     CC:::::::::::::::CS::::::SSSSSS:::::SS::::::SSSSSS:::::S
//       CCC::::::::::::CS:::::::::::::::SS S:::::::::::::::SS
//          CCCCCCCCCCCCC SSSSSSSSSSSSSSS    SSSSSSSSSSSSSSS
//
//
// http://patorjk.com/software/taag/#p=display&f=Graffiti&t=Type%20Something%20



// .leaflet-popup-useraction-buttons,
// .leaflet-popup-input-actions{
//    display: flex;
//    justify-content: space-between;
//    padding: 13px 19px 10px 19px;
// }
//
// a.leaflet-popup-remove-button,
// a.leaflet-popup-edit-button,
// a.leaflet-popup-input-cancel,
// a.leaflet-popup-input-save{
//    border-bottom: none;
//    text-decoration: none;
// }
// a.leaflet-popup-edit-button,
// a.leaflet-popup-input-save{
//    margin-left: auto;
//    text-align: right;
// }
// a.leaflet-popup-remove-button:hover,
// a.leaflet-popup-edit-button:hover,
// a.leaflet-popup-input-cancel:hover,
// a.leaflet-popup-input-save:hover{
//    color: #0078A8;
//    text-decoration: underline;
//    cursor: pointer;
// }
//
// .leaflet-popup-input{
//    border: 1px solid lightgrey;
//    min-width: 160px;
//    margin: 19px 19px 0px 19px;
//    padding: 5px;
// }
// .leaflet-popup-input:focus{
//    outline: 2px solid #60b7da;
//    border: 1px solid #60b7da;
// }
//
// .leaflet-popup-input-ruler{
//    position: fixed;
//    top: -100px;
//    visibility: hidden;
//    font: 12px/1.5 "Helvetica Neue", Arial, Helvetica, sans-serif;
//    background-color: lightgrey;
// }
