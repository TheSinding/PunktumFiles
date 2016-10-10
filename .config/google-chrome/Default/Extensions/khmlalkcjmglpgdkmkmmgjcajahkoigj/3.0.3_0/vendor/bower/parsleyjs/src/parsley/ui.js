import $ from 'jquery';
import ParsleyUtils from './utils';

var ParsleyUI = function (options) {
  this.__class__ = 'ParsleyUI';
};

ParsleyUI.prototype = {
  listen: function () {
    window.Parsley
    .on('form:init',       (form ) => { this.setupForm (form ); } )
    .on('field:init',      (field) => { this.setupField(field); } )
    .on('field:validated', (field) => { this.reflow    (field); } )
    .on('form:validated',  (form ) => { this.focus     (form ); } )
    .on('field:reset',     (field) => { this.reset     (field); } )
    .on('form:destroy',    (form ) => { this.destroy   (form ); } )
    .on('field:destroy',   (field) => { this.destroy   (field); } );

    return this;
  },

  reflow: function (fieldInstance) {
    // If this field has not an active UI (case for multiples) don't bother doing something
    if ('undefined' === typeof fieldInstance._ui || false === fieldInstance._ui.active)
      return;

    // Diff between two validation results
    var diff = this._diff(fieldInstance.validationResult, fieldInstance._ui.lastValidationResult);

    // Then store current validation result for next reflow
    fieldInstance._ui.lastValidationResult = fieldInstance.validationResult;

    // Handle valid / invalid / none field class
    this.manageStatusClass(fieldInstance);

    // Add, remove, updated errors messages
    this.manageErrorsMessages(fieldInstance, diff);

    // Triggers impl
    this.actualizeTriggers(fieldInstance);

    // If field is not valid for the first time, bind keyup trigger to ease UX and quickly inform user
    if ((diff.kept.length || diff.added.length) && true !== fieldInstance._ui.failedOnce)
      this.manageFailingFieldTrigger(fieldInstance);
  },

  // Returns an array of field's error message(s)
  getErrorsMessages: function (fieldInstance) {
    // No error message, field is valid
    if (true === fieldInstance.validationResult)
      return [];

    var messages = [];

    for (var i = 0; i < fieldInstance.validationResult.length; i++)
      messages.push(fieldInstance.validationResult[i].errorMessage ||
       this._getErrorMessage(fieldInstance, fieldInstance.validationResult[i].assert));

    return messages;
  },

  manageStatusClass: function (fieldInstance) {
    if (fieldInstance.hasConstraints() && fieldInstance.needsValidation() && true === fieldInstance.validationResult)
      this._successClass(fieldInstance);
    else if (fieldInstance.validationResult.length > 0)
      this._errorClass(fieldInstance);
    else
      this._resetClass(fieldInstance);
  },

  manageErrorsMessages: function (fieldInstance, diff) {
    if ('undefined' !== typeof fieldInstance.options.errorsMessagesDisabled)
      return;

    // Case where we have errorMessage option that configure an unique field error message, regardless failing validators
    if ('undefined' !== typeof fieldInstance.options.errorMessage) {
      if ((diff.added.length || diff.kept.length)) {
        this._insertErrorWrapper(fieldInstance);

        if (0 === fieldInstance._ui.$errorsWrapper.find('.parsley-custom-error-message').length)
          fieldInstance._ui.$errorsWrapper
            .append(
              $(fieldInstance.options.errorTemplate)
              .addClass('parsley-custom-error-message')
            );

        return fieldInstance._ui.$errorsWrapper
          .addClass('filled')
          .find('.parsley-custom-error-message')
          .html(fieldInstance.options.errorMessage);
      }

      return fieldInstance._ui.$errorsWrapper
        .removeClass('filled')
        .find('.parsley-custom-error-message')
        .remove();
    }

    // Show, hide, update failing constraints messages
    for (var i = 0; i < diff.removed.length; i++)
      this.removeError(fieldInstance, diff.removed[i].assert.name, true);

    for (i = 0; i < diff.added.length; i++)
      this.addError(fieldInstance, diff.added[i].assert.name, diff.added[i].errorMessage, diff.added[i].assert, true);

    for (i = 0; i < diff.kept.length; i++)
      this.updateError(fieldInstance, diff.kept[i].assert.name, diff.kept[i].errorMessage, diff.kept[i].assert, true);
  },

  // TODO: strange API here, intuitive for manual usage with addError(pslyInstance, 'foo', 'bar')
  // but a little bit complex for above internal usage, with forced undefined parameter...
  addError: function (fieldInstance, name, message, assert, doNotUpdateClass) {
    this._insertErrorWrapper(fieldInstance);
    fieldInstance._ui.$errorsWrapper
      .addClass('filled')
      .append(
        $(fieldInstance.options.errorTemplate)
        .addClass('parsley-' + name)
        .html(message || this._getErrorMessage(fieldInstance, assert))
      );

    if (true !== doNotUpdateClass)
      this._errorClass(fieldInstance);
  },

  // Same as above
  updateError: function (fieldInstance, name, message, assert, doNotUpdateClass) {
    fieldInstance._ui.$errorsWrapper
      .addClass('filled')
      .find('.parsley-' + name)
      .html(message || this._getErrorMessage(fieldInstance, assert));

    if (true !== doNotUpdateClass)
      this._errorClass(fieldInstance);
  },

  // Same as above twice
  removeError: function (fieldInstance, name, doNotUpdateClass) {
    fieldInstance._ui.$errorsWrapper
      .removeClass('filled')
      .find('.parsley-' + name)
      .remove();

    // edge case possible here: remove a standard Parsley error that is still failing in fieldInstance.validationResult
    // but highly improbable cuz' manually removing a well Parsley handled error makes no sense.
    if (true !== doNotUpdateClass)
      this.manageStatusClass(fieldInstance);
  },

  focus: function (formInstance) {
    formInstance._focusedField = null;

    if (true === formInstance.validationResult || 'none' === formInstance.options.focus)
      return null;

    for (var i = 0; i < formInstance.fields.length; i++) {
      var field = formInstance.fields[i];
      if (true !== field.validationResult && field.validationResult.length > 0 && 'undefined' === typeof field.options.noFocus) {
        formInstance._focusedField = field.$element;
        if ('first' === formInstance.options.focus)
          break;
      }
    }

    if (null === formInstance._focusedField)
      return null;

    return formInstance._focusedField.focus();
  },

  _getErrorMessage: function (fieldInstance, constraint) {
    var customConstraintErrorMessage = constraint.name + 'Message';

    if ('undefined' !== typeof fieldInstance.options[customConstraintErrorMessage])
      return window.Parsley.formatMessage(fieldInstance.options[customConstraintErrorMessage], constraint.requirements);

    return window.Parsley.getErrorMessage(constraint);
  },

  _diff: function (newResult, oldResult, deep) {
    var added = [];
    var kept = [];

    for (var i = 0; i < newResult.length; i++) {
      var found = false;

      for (var j = 0; j < oldResult.length; j++)
        if (newResult[i].assert.name === oldResult[j].assert.name) {
          found = true;
          break;
        }

      if (found)
        kept.push(newResult[i]);
      else
        added.push(newResult[i]);
    }

    return {
      kept: kept,
      added: added,
      removed: !deep ? this._diff(oldResult, newResult, true).added : []
    };
  },

  setupForm: function (formInstance) {
    formInstance.$element.on('submit.Parsley', evt => { formInstance.onSubmitValidate(evt); });
    formInstance.$element.on('click.Parsley', 'input[type="submit"], button[type="submit"]', evt => { formInstance.onSubmitButton(evt); });

    // UI could be disabled
    if (false === formInstance.options.uiEnabled)
      return;

    formInstance.$element.attr('novalidate', '');
  },

  setupField: function (fieldInstance) {
    var _ui = {active: false};

    // UI could be disabled
    if (false === fieldInstance.options.uiEnabled)
      return;

    _ui.active = true;

    // Give field its Parsley id in DOM
    fieldInstance.$element.attr(fieldInstance.options.namespace + 'id', fieldInstance.__id__);

    /** Generate important UI elements and store them in fieldInstance **/
    // $errorClassHandler is the $element that woul have parsley-error and parsley-success classes
    _ui.$errorClassHandler = this._manageClassHandler(fieldInstance);

    // $errorsWrapper is a div that would contain the various field errors, it will be appended into $errorsContainer
    _ui.errorsWrapperId = 'parsley-id-' + (fieldInstance.options.multiple ? 'multiple-' + fieldInstance.options.multiple : fieldInstance.__id__);
    _ui.$errorsWrapper = $(fieldInstance.options.errorsWrapper).attr('id', _ui.errorsWrapperId);

    // ValidationResult UI storage to detect what have changed bwt two validations, and update DOM accordingly
    _ui.lastValidationResult = [];
    _ui.validationInformationVisible = false;

    // Store it in fieldInstance for later
    fieldInstance._ui = _ui;

    // Bind triggers first time
    this.actualizeTriggers(fieldInstance);
  },

  // Determine which element will have `parsley-error` and `parsley-success` classes
  _manageClassHandler: function (fieldInstance) {
    // An element selector could be passed through DOM with `data-parsley-class-handler=#foo`
    if ('string' === typeof fieldInstance.options.classHandler && $(fieldInstance.options.classHandler).length)
      return $(fieldInstance.options.classHandler);

    // Class handled could also be determined by function given in Parsley options
    var $handler = fieldInstance.options.classHandler(fieldInstance);

    // If this function returned a valid existing DOM element, go for it
    if ('undefined' !== typeof $handler && $handler.length)
      return $handler;

    // Otherwise, if simple element (input, texatrea, select...) it will perfectly host the classes
    if (!fieldInstance.options.multiple || fieldInstance.$element.is('select'))
      return fieldInstance.$element;

    // But if multiple element (radio, checkbox), that would be their parent
    return fieldInstance.$element.parent();
  },

  _insertErrorWrapper: function (fieldInstance) {
    var $errorsContainer;

    // Nothing to do if already inserted
    if (0 !== fieldInstance._ui.$errorsWrapper.parent().length)
      return fieldInstance._ui.$errorsWrapper.parent();

    if ('string' === typeof fieldInstance.options.errorsContainer) {
      if ($(fieldInstance.options.errorsContainer).length)
        return $(fieldInstance.options.errorsContainer).append(fieldInstance._ui.$errorsWrapper);
      else
        ParsleyUtils.warn('The errors container `' + fieldInstance.options.errorsContainer + '` does not exist in DOM');
    } else if ('function' === typeof fieldInstance.options.errorsContainer)
      $errorsContainer = fieldInstance.options.errorsContainer(fieldInstance);

    if ('undefined' !== typeof $errorsContainer && $errorsContainer.length)
      return $errorsContainer.append(fieldInstance._ui.$errorsWrapper);

    var $from = fieldInstance.$element;
    if (fieldInstance.options.multiple)
      $from = $from.parent();
    return $from.after(fieldInstance._ui.$errorsWrapper);
  },

  actualizeTriggers: function (fieldInstance) {
    var $toBind = fieldInstance._findRelated();

    // Remove Parsley events already binded on this field
    $toBind.off('.Parsley');

    // If no trigger is set, all good
    if (false === fieldInstance.options.trigger)
      return;

    var triggers = fieldInstance.options.trigger.replace(/^\s+/g , '').replace(/\s+$/g , '');

    if ('' === triggers)
      return;

    $toBind.on(
      triggers.split(' ').join('.Parsley ') + '.Parsley',
      event => { this.eventValidate(fieldInstance, event); }
    );
  },

  eventValidate: function (field, event) {
    // For keyup, keypress, keydown... events that could be a little bit obstrusive
    // do not validate if val length < min threshold on first validation. Once field have been validated once and info
    // about success or failure have been displayed, always validate with this trigger to reflect every yalidation change.
    if (/key/.test(event.type))
      if (!field._ui.validationInformationVisible && field.getValue().length <= field.options.validationThreshold)
        return;

    field.validate();
  },

  manageFailingFieldTrigger: function (fieldInstance) {
    fieldInstance._ui.failedOnce = true;

    // Radio and checkboxes fields must bind every field multiple
    if (fieldInstance.options.multiple)
      fieldInstance._findRelated().each(function () {
        if (!/change/i.test($(this).parsley().options.trigger || ''))
          $(this).on('change.ParsleyFailedOnce', () => { fieldInstance.validate(); });
      });

    // Select case
    if (fieldInstance.$element.is('select'))
      if (!/change/i.test(fieldInstance.options.trigger || ''))
        return fieldInstance.$element.on('change.ParsleyFailedOnce', () => { fieldInstance.validate(); });

    // All other inputs fields
    if (!/keyup/i.test(fieldInstance.options.trigger || ''))
      return fieldInstance.$element.on('keyup.ParsleyFailedOnce', () => { fieldInstance.validate(); });
  },

  reset: function (parsleyInstance) {
    // Reset all event listeners
    this.actualizeTriggers(parsleyInstance);
    parsleyInstance.$element.off('.ParsleyFailedOnce');

    // Nothing to do if UI never initialized for this field
    if ('undefined' === typeof parsleyInstance._ui)
      return;

    if ('ParsleyForm' === parsleyInstance.__class__)
      return;

    // Reset all errors' li
    parsleyInstance._ui.$errorsWrapper
      .removeClass('filled')
      .children()
      .remove();

    // Reset validation class
    this._resetClass(parsleyInstance);

    // Reset validation flags and last validation result
    parsleyInstance._ui.lastValidationResult = [];
    parsleyInstance._ui.validationInformationVisible = false;
    parsleyInstance._ui.failedOnce = false;
  },

  destroy: function (parsleyInstance) {
    this.reset(parsleyInstance);

    if ('ParsleyForm' === parsleyInstance.__class__)
      return;

    if ('undefined' !== typeof parsleyInstance._ui)
      parsleyInstance._ui.$errorsWrapper.remove();

    delete parsleyInstance._ui;
  },

  _successClass: function (fieldInstance) {
    fieldInstance._ui.validationInformationVisible = true;
    fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.errorClass).addClass(fieldInstance.options.successClass);
  },
  _errorClass: function (fieldInstance) {
    fieldInstance._ui.validationInformationVisible = true;
    fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.successClass).addClass(fieldInstance.options.errorClass);
  },
  _resetClass: function (fieldInstance) {
    fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.successClass).removeClass(fieldInstance.options.errorClass);
  }
};

export default ParsleyUI;
