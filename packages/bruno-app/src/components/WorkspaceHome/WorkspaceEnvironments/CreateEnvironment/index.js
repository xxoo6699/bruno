import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Portal from 'components/Portal';
import Modal from 'components/Modal';
import { addGlobalEnvironment } from 'providers/ReduxStore/slices/global-environments';
import { validateName, validateNameError } from 'utils/common/regex';

const CreateEnvironment = ({ onClose, onEnvironmentCreated }) => {
  const globalEnvs = useSelector((state) => state?.globalEnvironments?.globalEnvironments);
  const { t } = useTranslation();

  const validateEnvironmentName = (name) => {
    const trimmedName = name?.toLowerCase().trim();
    return (globalEnvs || []).every((env) => env?.name?.toLowerCase().trim() !== trimmedName);
  };

  const dispatch = useDispatch();
  const inputRef = useRef();
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: ''
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(1, t('Must be at least 1 character'))
        .max(255, t('Must be 255 characters or less'))
        .test('is-valid-filename', function (value) {
          const isValid = validateName(value);
          return isValid ? true : this.createError({ message: validateNameError(value) });
        })
        .required(t('Name is required'))
        .test('duplicate-name', t('Global environment already exists'), validateEnvironmentName)
    }),
    onSubmit: (values) => {
      dispatch(addGlobalEnvironment({ name: values.name }))
        .then(() => {
          toast.success(t('Global environment created!'));
          onClose();
          // Call the callback if provided
          if (onEnvironmentCreated) {
            onEnvironmentCreated();
          }
        })
        .catch(() => toast.error(t('An error occurred while creating the environment')));
    }
  });

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  const onSubmit = () => {
    formik.handleSubmit();
  };

  return (
    <Portal>
      <Modal
        size="md"
        title={t('Create Global Environment')}
        confirmText={t('Create')}
        handleConfirm={onSubmit}
        handleCancel={onClose}
        dataTestId="create-global-environment-modal"
      >
        <form className="bruno-form" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="environment-name" className="block font-semibold">
              {t('Environment Name')}
            </label>
            <div className="flex items-center mt-2">
              <input
                id="environment-name"
                type="text"
                name="name"
                ref={inputRef}
                data-testid="environment-name-input"
                className="block textbox w-full"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                onChange={formik.handleChange}
                value={formik.values.name || ''}
              />
            </div>
            {formik.touched.name && formik.errors.name ? (
              <div className="text-red-500">{formik.errors.name}</div>
            ) : null}
          </div>
        </form>
      </Modal>
    </Portal>
  );
};

export default CreateEnvironment;
