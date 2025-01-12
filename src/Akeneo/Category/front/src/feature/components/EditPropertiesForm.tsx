import React from 'react';
import styled from 'styled-components';
import {useSecurity, useTranslate} from '@akeneo-pim-community/shared';
import {Category} from '../models';
import {Field, Helper, SectionTitle, TextInput} from 'akeneo-design-system';
import {EditCategoryForm} from '../hooks';

const FormContainer = styled.div`
  & > * {
    margin: 0 10px 20px 0;
  }
`;

const ErrorMessage = styled(Helper)`
  margin: 20px 0 0 0;
`;

type Props = {
  category: Category;
  formData: EditCategoryForm | null;
  onChangeLabel: (locale: string, label: string) => void;
};

const EditPropertiesForm = ({category, formData, onChangeLabel}: Props) => {
  const translate = useTranslate();
  const {isGranted} = useSecurity();

  if (formData === null) {
    return <></>;
  }

  return (
    <FormContainer>
      {formData.errors.map((errorMessage, key) => {
        return (
          <ErrorMessage level="error" key={`error-${key}`}>
            {errorMessage}
          </ErrorMessage>
        );
      })}
      <SectionTitle>
        <SectionTitle.Title>{translate('pim_common.code')}</SectionTitle.Title>
      </SectionTitle>
      <Field label={translate('pim_common.code')} requiredLabel={translate('pim_common.required_label')}>
        <TextInput name="code" readOnly={true} value={category.code} />
      </Field>
      <SectionTitle>
        <SectionTitle.Title>{translate('pim_common.label')}</SectionTitle.Title>
      </SectionTitle>
      {Object.entries(formData.label).map(([locale, labelField]) => (
        <Field label={labelField.label} key={locale}>
          <TextInput
            name={labelField.fullName}
            readOnly={!isGranted('pim_enrich_product_category_edit')}
            onChange={changedLabel => onChangeLabel(locale, changedLabel)}
            value={labelField.value}
          />
        </Field>
      ))}
    </FormContainer>
  );
};
export {EditPropertiesForm};
