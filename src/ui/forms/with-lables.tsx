"use client";
import withLabel from "~/ui/forms/with-label";
import TextField from "~/ui/forms/text-field";

import { EnglishAndNumberField } from "~/ui/forms/english-field";
import PhoneField from "~/ui/forms/phone-field";
import withConfirmation from "~/ui/with-confirmation";
import Button from "~/ui/buttons";
import TextAreaField from "~/ui/forms/textarea-field";
import IntegerField from "~/ui/forms/integer-field";

const TextFieldWithLabel = withLabel(TextField);
const TextAreaWithLabel = withLabel(TextAreaField);
const NumberFieldWithLabel = withLabel(IntegerField);
const PhoneFieldWithLabel = withLabel(PhoneField);
const EnglishAndNumberFieldWithLabel = withLabel(EnglishAndNumberField);

const ButtonWithConfirmation = withConfirmation(Button);
export {
  TextFieldWithLabel,
  TextAreaWithLabel,
  PhoneFieldWithLabel,
  EnglishAndNumberFieldWithLabel,
  NumberFieldWithLabel,
  ButtonWithConfirmation,
};
